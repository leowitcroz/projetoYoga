import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { RespostasOnboardingDto, RespostasSaudeDto } from '../auth/dto/registro.dto.js';
import { OnboardingService } from './onboarding.service.js';

@Controller('onboarding')
@UseGuards(JwtGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get()
  buscar(@UsuarioId() usuarioId: string) {
    return this.onboarding.buscar(usuarioId);
  }

  @Put()
  salvar(@UsuarioId() usuarioId: string, @Body() respostas: RespostasOnboardingDto) {
    return this.onboarding.salvar(usuarioId, respostas);
  }

  @Put('saude')
  salvarSaude(@UsuarioId() usuarioId: string, @Body() respostas: RespostasSaudeDto) {
    return this.onboarding.salvarSaude(usuarioId, respostas);
  }
}
