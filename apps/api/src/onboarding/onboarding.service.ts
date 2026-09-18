import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RespostasOnboardingDto, RespostasSaudeDto } from '../auth/dto/registro.dto.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /** ONB-08 — devolve o que já foi respondido, para retomar de onde parou. */
  async buscar(userId: string) {
    const perfil = await this.prisma.onboardingProfile.findUnique({ where: { userId } });
    return perfil ?? { userId, passoConcluido: 0 };
  }

  /** F2.12 — salva um bloco de respostas por vez. */
  async salvar(userId: string, respostas: RespostasOnboardingDto) {
    return this.prisma.onboardingProfile.upsert({
      where: { userId },
      create: { userId, ...respostas },
      update: { ...respostas },
    });
  }

  /** F2.13 — saúde só entra com consentimento de saúde ativo (ONB-03). */
  async salvarSaude(userId: string, respostas: RespostasSaudeDto) {
    const consentimento = await this.prisma.consent.findFirst({
      where: { userId, tipo: 'SAUDE', aceito: true },
      orderBy: { criadoEm: 'desc' },
    });

    if (!consentimento) {
      throw new ForbiddenException('É preciso consentir com o uso dos dados de saúde');
    }

    await this.prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, ...respostas },
      update: { ...respostas },
    });

    // Não devolvemos as condições: a resposta da API também não precisa carregá-las.
    return { salvo: true };
  }
}
