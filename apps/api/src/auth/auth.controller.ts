import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { EmailDto, LoginDto, RedefinirSenhaDto, RefreshDto, TokenDto } from './dto/login.dto.js';
import { JwtGuard, UsuarioId } from './jwt.guard.js';

/**
 * F2.7 — as rotas de conta são as mais atacadas: senha por tentativa e erro,
 * e-mail usado como lista de quem tem conta. Por isso cada uma tem o seu
 * limite, bem menor que o teto geral da API.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** AUTH-01 — cadastro no fim do onboarding, já com as respostas. */
  @Throttle({ geral: { ttl: 3600_000, limit: 5 } })
  @Post('registro')
  registrar(@Body() dados: RegistroDto) {
    return this.auth.registrar(dados);
  }

  /** AUTH-03 — login. */
  @Throttle({ geral: { ttl: 900_000, limit: 10 } })
  @Post('login')
  @HttpCode(200)
  entrar(@Body() dados: LoginDto) {
    return this.auth.entrar(dados);
  }

  /** AUTH-03 — renova o acesso sem pedir a senha de novo. */
  @Post('refresh')
  @HttpCode(200)
  renovar(@Body() dados: RefreshDto) {
    return this.auth.renovar(dados.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  async sair(@Body() dados: RefreshDto): Promise<void> {
    await this.auth.sair(dados.refreshToken);
  }

  /** AUTH-02 — confirma o e-mail pelo link recebido. */
  @Throttle({ geral: { ttl: 3600_000, limit: 20 } })
  @Post('verificar-email')
  @HttpCode(200)
  verificarEmail(@Body() dados: TokenDto) {
    return this.auth.verificarEmail(dados.token);
  }

  /**
   * AUTH-02 — reenvia a confirmação.
   *
   * Responde 202 sempre, mesmo para e-mail que não existe: quem tenta
   * adivinhar não descobre quem tem conta aqui.
   */
  @Throttle({ geral: { ttl: 3600_000, limit: 5 } })
  @Post('reenviar-verificacao')
  @HttpCode(202)
  async reenviarVerificacao(@Body() dados: EmailDto): Promise<void> {
    await this.auth.reenviarVerificacao(dados.email);
  }

  /** AUTH-04 — "esqueci minha senha". Também responde igual para todo mundo. */
  @Throttle({ geral: { ttl: 3600_000, limit: 5 } })
  @Post('esqueci-senha')
  @HttpCode(202)
  async esqueciSenha(@Body() dados: EmailDto): Promise<void> {
    await this.auth.pedirRedefinicaoDeSenha(dados.email);
  }

  /** AUTH-04 — escolhe a senha nova com o link recebido. */
  @Throttle({ geral: { ttl: 3600_000, limit: 10 } })
  @Post('redefinir-senha')
  @HttpCode(200)
  async redefinirSenha(@Body() dados: RedefinirSenhaDto): Promise<{ redefinida: true }> {
    await this.auth.redefinirSenha(dados.token, dados.senha);
    return { redefinida: true };
  }

  /** Quem sou eu: o app usa isso para saber se a sessão salva ainda vale. */
  @Get('eu')
  @UseGuards(JwtGuard)
  eu(@UsuarioId() usuarioId: string) {
    return this.auth.buscarUsuario(usuarioId);
  }
}
