import { randomBytes, createHash } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
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
  usuario: { id: string; nome: string; email: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(dados: RegistroDto): Promise<Sessao> {
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
      select: { id: true, nome: true, email: true },
    });

    return this.abrirSessao(usuario);
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

    return this.abrirSessao({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  }

  /** Troca um refresh válido por um par novo e invalida o antigo (rotação). */
  async renovar(refreshToken: string): Promise<Sessao> {
    const guardado = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashDoToken(refreshToken) },
      include: { user: { select: { id: true, nome: true, email: true } } },
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
      select: { id: true, nome: true, email: true, telefone: true, criadoEm: true },
    });
    if (!usuario) throw new UnauthorizedException('Conta não encontrada');
    return usuario;
  }

  private async abrirSessao(usuario: { id: string; nome: string; email: string }): Promise<Sessao> {
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
