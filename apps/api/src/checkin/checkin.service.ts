import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CheckinDto } from './dto/checkin.dto.js';

/**
 * Check-in diário (CHK-01 a CHK-04).
 *
 * Um por pessoa por dia. Refazer no mesmo dia sobrescreve — e é isso que
 * permite recalcular a recomendação sem criar histórico falso (CHK-04).
 */
@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(userId: string, dados: CheckinDto) {
    const { dia, ...respostas } = dados;
    // Sem dor não faz sentido guardar região nenhuma.
    const regiaoDaDor = respostas.dor === 'nenhuma' ? null : (respostas.regiaoDaDor ?? null);

    const checkin = await this.prisma.dailyCheckin.upsert({
      where: { userId_dia: { userId, dia } },
      create: { userId, dia, ...respostas, regiaoDaDor },
      update: { ...respostas, regiaoDaDor },
    });

    return { dia: checkin.dia, salvoEm: checkin.atualizadoEm };
  }

  buscarDoDia(userId: string, dia: string) {
    return this.prisma.dailyCheckin.findUnique({ where: { userId_dia: { userId, dia } } });
  }

  /**
   * Há quantos dias seguidos a pessoa relata dor (SEG-R03).
   * Conta para trás a partir de hoje e para no primeiro dia sem dor.
   */
  async diasSeguidosComDor(userId: string, dia: string): Promise<number> {
    const ultimos = await this.prisma.dailyCheckin.findMany({
      where: { userId, dia: { lte: dia } },
      orderBy: { dia: 'desc' },
      take: 30,
      select: { dia: true, dor: true },
    });

    let seguidos = 0;
    let esperado = dia;

    for (const checkin of ultimos) {
      if (checkin.dia !== esperado) break; // faltou um dia: a sequência quebrou
      if (checkin.dor === 'nenhuma') break;

      seguidos += 1;
      esperado = diaAnterior(esperado);
    }

    return seguidos;
  }
}

function diaAnterior(dia: string): string {
  const [ano, mes, data] = dia.split('-').map(Number);
  const anterior = new Date(Date.UTC(ano ?? 0, (mes ?? 1) - 1, (data ?? 1) - 1));
  return anterior.toISOString().slice(0, 10);
}
