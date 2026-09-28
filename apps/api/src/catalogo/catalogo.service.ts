import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FiltrosDoCatalogoDto } from './dto/filtros.dto.js';

/**
 * Catálogo para o app (F2.15).
 *
 * A biblioteca é diferente da recomendação: aqui a pessoa escolhe sozinha, e
 * por isso aparece tudo o que está aprovado. O motor deixar de recomendar algo
 * hoje não impede o acesso a esse conteúdo (SEG-R02).
 */
@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosDoCatalogoDto) {
    const where: Record<string, unknown> = { aprovado: true };

    if (filtros.modalidade) where.modalidade = filtros.modalidade;
    if (filtros.duracaoMax) where.duracaoMin = { lte: filtros.duracaoMax };
    if (filtros.busca) {
      where.titulo = { contains: filtros.busca, mode: 'insensitive' };
    }

    const conteudos = await this.prisma.content.findMany({
      where,
      orderBy: [{ duracaoMin: 'asc' }, { titulo: 'asc' }],
      take: 100,
      select: {
        id: true,
        titulo: true,
        modalidade: true,
        duracaoMin: true,
        nivelTecnico: true,
        demandaFisica: true,
        objetivos: true,
      },
    });

    // Filtrar por objetivo em JSON dá consulta complicada; com o catálogo
    // limitado a 100 itens, é mais simples (e rápido) filtrar aqui.
    if (!filtros.objetivo) return conteudos;

    const objetivo = filtros.objetivo;
    return conteudos.filter((conteudo) => {
      const objetivos = conteudo.objetivos as Record<string, number> | null;
      return (objetivos?.[objetivo] ?? 0) > 0;
    });
  }

  /** Modalidades que têm pelo menos uma aula aprovada, para montar os filtros. */
  async modalidades(): Promise<string[]> {
    const linhas = await this.prisma.content.findMany({
      where: { aprovado: true },
      distinct: ['modalidade'],
      orderBy: { modalidade: 'asc' },
      select: { modalidade: true },
    });
    return linhas.map((linha) => linha.modalidade);
  }

  async detalhar(id: string) {
    const conteudo = await this.prisma.content.findFirst({
      where: { id, aprovado: true },
      select: {
        id: true,
        titulo: true,
        modalidade: true,
        duracaoMin: true,
        nivelTecnico: true,
        demandaFisica: true,
        area: true,
        objetivos: true,
        trilhaId: true,
        ordemTrilha: true,
      },
    });

    if (!conteudo) throw new NotFoundException('Aula não encontrada');
    return conteudo;
  }
}
