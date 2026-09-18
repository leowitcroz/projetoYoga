import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto, RefreshDto } from './dto/login.dto.js';
import { JwtGuard, UsuarioId } from './jwt.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** AUTH-01 — cadastro no fim do onboarding, já com as respostas. */
  @Post('registro')
  registrar(@Body() dados: RegistroDto) {
    return this.auth.registrar(dados);
  }

  /** AUTH-03 — login. */
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

  /** Quem sou eu: o app usa isso para saber se a sessão salva ainda vale. */
  @Get('eu')
  @UseGuards(JwtGuard)
  eu(@UsuarioId() usuarioId: string) {
    return this.auth.buscarUsuario(usuarioId);
  }
}
