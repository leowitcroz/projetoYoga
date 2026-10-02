import { randomBytes, createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { TokensService } from './tokens.service.js';
import type { RegistroDto } from './dto/registro.dto.js';
import type { LoginDto } from './dto/login.dto.js';

/** Versão do texto da política aceita no cadastro. Muda quando o texto mudar. */
const VERSAO_POLITICA = '2026-09-10';

const MINUTOS_DO_ACESSO = 15;
const DIAS_DO_REFRESH = 30;

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  expiraEm: number;
  /** O papel vem junto para o app saber que aquela conta não é de aluno. */
  usuario: { id: string; nome: string; email: string; papel: string };
}

/**
 * O que o cadastro devolve.
 *
 * Quando a confirmação de e-mail está exigida (AUTH-02), o cadastro **não**
 * abre sessão: a pessoa precisa provar que o e-mail é dela antes de entrar.
 * Com a exigência desligada, a sessão vem junto e ela entra direto.
 */
export type ResultadoDoCadastro =
  { precisaVerificarEmail: true; email: string } | ({ precisaVerificarEmail: false } & Sessao);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly tokens: TokensService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * AUTH-02 — conta sem e-mail confirmado não entra no app.
   *
   * Dá para desligar com EXIGIR_EMAIL_VERIFICADO=0 em ambientes sem provedor
   * de e-mail, como a demonstração: sem isso, ninguém conseguiria entrar.
   */
  private get exigeEmailVerificado(): boolean {
    return this.config.get<string>('EXIGIR_EMAIL_VERIFICADO') !== '0';
  }

  async registrar(dados: RegistroDto): Promise<ResultadoDoCadastro> {
    const email = dados.email.trim().toLowerCase();

    const jaExiste = await this.prisma.user.findUnique({ where: { email } });
    if (jaExiste) throw new ConflictException('Já existe uma conta com este e-mail');

    const senhaHash = await argon2.hash(dados.senha, { type: argon2.argon2id });
    const salvaSaude = dados.aceiteSaude === true && dados.saude !== undefined;

    const usuario = await this.prisma.user.create({
      data: {
        nome: dados.nome.trim(),
        email,
        telefone: dados.telefone.trim(),
        senhaHash,
        consentimentos: {
          create: [
            { tipo: 'PRIVACIDADE', aceito: true, versao: VERSAO_POLITICA },
            ...(dados.aceiteSaude === undefined
              ? []
              : [
                  {
                    tipo: 'SAUDE' as const,
                    aceito: dados.aceiteSaude,
                    versao: VERSAO_POLITICA,
                  },
                ]),
          ],
        },
        ...(dados.onboarding ? { perfil: { create: { ...dados.onboarding } } } : {}),
        // Sem consentimento de saúde ativo, as respostas do passo 3 são descartadas (ONB-03).
        ...(salvaSaude ? { saude: { create: { ...dados.saude! } } } : {}),
      },
      select: { id: true, nome: true, email: true, papel: true },
    });

    await this.mandarVerificacao(usuario);

    if (this.exigeEmailVerificado) {
      return { precisaVerificarEmail: true, email: usuario.email };
    }
    return { precisaVerificarEmail: false, ...(await this.abrirSessao(usuario)) };
  }

  /** Cria o link de confirmação e manda por e-mail (AUTH-02). */
  private async mandarVerificacao(usuario: {
    id: string;
    nome: string;
    email: string;
  }): Promise<void> {
    const token = await this.tokens.criar(usuario.id, 'VERIFICACAO_EMAIL');
    await this.email.enviarVerificacao(usuario.email, usuario.nome, token);
  }

  /** AUTH-02 — confirma o e-mail a partir do link recebido. */
  async verificarEmail(token: string): Promise<{ verificado: true }> {
    const userId = await this.tokens.usar(token, 'VERIFICACAO_EMAIL');
    if (!userId) {
      throw new BadRequestException('Link inválido ou vencido. Peça um novo e-mail de confirmação');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificadoEm: new Date() },
    });

    return { verificado: true };
  }

  /**
   * Reenvia a confirmação.
   *
   * Responde igual para e-mail que existe e para e-mail que não existe: quem
   * tenta adivinhar não descobre quem tem conta aqui.
   */
  async reenviarVerificacao(email: string): Promise<void> {
    const usuario = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, nome: true, email: true, emailVerificadoEm: true },
    });

    if (!usuario || usuario.emailVerificadoEm) return;
    await this.mandarVerificacao(usuario);
  }

  /** AUTH-04 — primeiro passo: pedir o link de redefinição. */
  async pedirRedefinicaoDeSenha(email: string): Promise<void> {
    const usuario = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, nome: true, email: true },
    });
    if (!usuario) return; // mesma resposta de sempre

    const token = await this.tokens.criar(usuario.id, 'REDEFINICAO_SENHA');
    await this.email.enviarRedefinicaoDeSenha(usuario.email, usuario.nome, token);
  }

  /** AUTH-04 — segundo passo: trocar a senha e derrubar as sessões abertas. */
  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    const userId = await this.tokens.usar(token, 'REDEFINICAO_SENHA');
    if (!userId) {
      throw new BadRequestException('Link inválido ou vencido. Peça a redefinição de novo');
    }

    const senhaHash = await argon2.hash(novaSenha, { type: argon2.argon2id });
    await this.prisma.user.update({ where: { id: userId }, data: { senhaHash } });

    // Trocar a senha encerra as sessões antigas: é o que torna a redefinição
    // útil quando alguém mais tinha acesso à conta.
    await this.prisma.refreshToken.updateMany({
      where: { userId, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  async entrar(dados: LoginDto): Promise<Sessao> {
    const email = dados.email.trim().toLowerCase();
    const usuario = await this.prisma.user.findUnique({ where: { email } });

    // Resposta igual para e-mail que não existe e para senha errada: quem tenta
    // adivinhar não descobre quais e-mails estão cadastrados.
    const erro = new UnauthorizedException('E-mail ou senha incorretos');
    if (!usuario) {
      await argon2.hash('senha-que-nao-existe');
      throw erro;
    }

    const confere = await argon2.verify(usuario.senhaHash, dados.senha);
    if (!confere) throw erro;

    if (this.exigeEmailVerificado && !usuario.emailVerificadoEm) {
      throw new ForbiddenException(
        'Confirme o seu e-mail para entrar. Veja a mensagem que enviamos a você',
      );
    }

    return this.abrirSessao({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    });
  }

  /** Troca um refresh válido por um par novo e invalida o antigo (rotação). */
  async renovar(refreshToken: string): Promise<Sessao> {
    const guardado = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashDoToken(refreshToken) },
      include: { user: { select: { id: true, nome: true, email: true, papel: true } } },
    });

    if (!guardado || guardado.revogadoEm !== null || guardado.expiraEm < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Entre de novo');
    }

    await this.prisma.refreshToken.update({
      where: { id: guardado.id },
      data: { revogadoEm: new Date() },
    });

    return this.abrirSessao(guardado.user);
  }

  /** Sair do app: o refresh daquele aparelho deixa de valer (AUTH-03). */
  async sair(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashDoToken(refreshToken), revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  async buscarUsuario(id: string) {
    const usuario = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, telefone: true, papel: true, criadoEm: true },
    });
    if (!usuario) throw new UnauthorizedException('Conta não encontrada');
    return usuario;
  }

  private async abrirSessao(usuario: {
    id: string;
    nome: string;
    email: string;
    papel: string;
  }): Promise<Sessao> {
    const accessToken = await this.jwt.signAsync(
      { sub: usuario.id, email: usuario.email },
      { expiresIn: `${MINUTOS_DO_ACESSO}m` },
    );

    // O refresh é um segredo aleatório, não um JWT: assim ele pode ser
    // revogado de verdade no banco.
    const refreshToken = randomBytes(48).toString('base64url');
    const expiraEm = new Date(Date.now() + DIAS_DO_REFRESH * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId: usuario.id, tokenHash: this.hashDoToken(refreshToken), expiraEm },
    });

    return {
      accessToken,
      refreshToken,
      expiraEm: Date.now() + MINUTOS_DO_ACESSO * 60 * 1000,
      usuario,
    };
  }

  private hashDoToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
