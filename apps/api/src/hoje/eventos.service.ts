import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { EventoDto, FeedbackDto } from './dto/evento.dto.js';

/**
 * Eventos de uso e feedback pós-prática (F2.18).
 *
 * São duas coisas em uma: o que alimenta o histórico do motor (MOT-07) e o
 * que, na Fase 6, vira aprendizado (MOT-20). Por enquanto registramos com
 * cuidado e usamos só o histórico.
 */
@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(userId: string, conteudoId: string, dados: EventoDto) {
    await this.confirmarQueExiste(conteudoId);

    const evento = await this.prisma.practiceEvent.create({
      data: { userId, conteudoId, dia: dados.dia, tipo: dados.tipo as never },
      select: { id: true, tipo: true, dia: true },
    });

    return evento;
  }

  /**
   * O feedback vem depois da prática e se prende ao evento de conclusão: sem
   * ter concluído, não há o que avaliar.
   */
  async avaliar(userId: string, conteudoId: string, dados: FeedbackDto) {
    const conclusao = await this.prisma.practiceEvent.findFirst({
      where: { userId, conteudoId, tipo: 'CONCLUIDA', dia: dados.dia },
      orderBy: { criadoEm: 'desc' },
    });

    if (!conclusao) {
      throw new BadRequestException('Marque a prática como concluída antes de avaliá-la');
    }

    return this.prisma.practiceEvent.update({
      where: { id: conclusao.id },
      data: { gostou: dados.gostou, intensidadePercebida: dados.intensidadePercebida ?? null },
      select: { id: true, gostou: true, intensidadePercebida: true },
    });
  }

  /** CTX-004 — a Home muda depois que a pessoa pratica. */
  async concluiuHoje(userId: string, dia: string): Promise<boolean> {
    const quantos = await this.prisma.practiceEvent.count({
      where: { userId, dia, tipo: 'CONCLUIDA' },
    });
    return quantos > 0;
  }

  private async confirmarQueExiste(conteudoId: string): Promise<void> {
    const existe = await this.prisma.content.findUnique({
      where: { id: conteudoId },
      select: { id: true },
    });
    if (!existe) throw new NotFoundException('Prática não encontrada');
  }
}
