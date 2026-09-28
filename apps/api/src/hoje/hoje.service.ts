import { Injectable, NotFoundException } from '@nestjs/common';
import { recomendarDia } from '@life/motor';
import type { Conteudo, PraticaRealizada, ResultadoDia } from '@life/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckinService } from '../checkin/checkin.service.js';
import { paraCheckin, paraConteudo, paraContexto, type LinhaDeConteudo } from './tradutor.js';

/**
 * `GET /hoje` (F2.16, MOT-08): carrega o contexto, chama o motor, guarda a
 * recomendação com a auditoria e devolve o resultado.
 *
 * A decisão em si não mora aqui — mora no `@life/motor`. Este serviço só
 * busca os dados, traduz e registra.
 */
@Injectable()
export class HojeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkins: CheckinService,
  ) {}

  async recomendar(userId: string, dia: string, agora: Date): Promise<ResultadoDia> {
    const checkinDoDia = await this.checkins.buscarDoDia(userId, dia);
    if (!checkinDoDia) {
      // HOME-01: sem check-in, a Home não recomenda.
      throw new NotFoundException('Faça o check-in de hoje para receber a recomendação');
    }

    const [perfil, saude, catalogo, historico, diasComDor] = await Promise.all([
      this.prisma.onboardingProfile.findUnique({ where: { userId } }),
      this.buscarSaude(userId),
      this.prisma.content.findMany({ where: { aprovado: true } }),
      this.buscarHistorico(userId),
      this.checkins.diasSeguidosComDor(userId, dia),
    ]);

    const contexto = paraContexto({
      perfil,
      saude,
      checkin: paraCheckin(checkinDoDia),
      historico,
      diasSeguidosComDor: diasComDor,
    });

    const conteudos: Conteudo[] = (catalogo as unknown as LinhaDeConteudo[]).map(paraConteudo);
    const resultado = recomendarDia(contexto, conteudos, { agora });

    await this.registrar(userId, dia, resultado);
    return resultado;
  }

  /**
   * Saúde só é lida com consentimento ativo (PRIV-01). Sem ele, devolvemos
   * `null` e o motor entra em modo conservador (MOT-12).
   */
  private async buscarSaude(userId: string): Promise<{ condicoes: string[] } | null> {
    const consentimento = await this.prisma.consent.findFirst({
      where: { userId, tipo: 'SAUDE', aceito: true },
      orderBy: { criadoEm: 'desc' },
    });
    if (!consentimento) return null;

    const saude = await this.prisma.healthProfile.findUnique({ where: { userId } });
    return saude ? { condicoes: saude.condicoes } : null;
  }

  private async buscarHistorico(userId: string): Promise<PraticaRealizada[]> {
    const recentes = await this.prisma.recommendation.findMany({
      where: { userId, principalId: { not: null } },
      orderBy: { dia: 'desc' },
      take: 30,
      select: { principalId: true, dia: true },
    });

    const ids = recentes.map((item) => item.principalId as string);
    const conteudos = await this.prisma.content.findMany({
      where: { id: { in: ids } },
      select: { id: true, trilhaId: true, ordemTrilha: true },
    });

    return recentes.map((item) => {
      const conteudo = conteudos.find((c) => c.id === item.principalId);
      return {
        conteudoId: item.principalId as string,
        dia: item.dia,
        trilhaId: conteudo?.trilhaId ?? undefined,
        ordemTrilha: conteudo?.ordemTrilha ?? undefined,
      };
    });
  }

  /** MOT-10: toda recomendação fica registrada com a auditoria completa. */
  private async registrar(userId: string, dia: string, resultado: ResultadoDia): Promise<void> {
    await this.prisma.recommendation.create({
      data: {
        userId,
        dia,
        principalId: resultado.principal?.conteudo.id ?? null,
        alternativaId: resultado.alternativa?.conteudo.id ?? null,
        estadoFuncional: resultado.estadoFuncional,
        versaoConfig: resultado.auditoria.versaoConfig,
        auditoria: JSON.parse(JSON.stringify(resultado.auditoria)) as object,
      },
    });
  }
}
