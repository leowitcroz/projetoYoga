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
    const where: Record<string, unknown> = { status: 'APROVADO' };

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
        capaUrl: true,
        professor: true,
        videoId: true,
        objetivos: true,
      },
    });

    // A lista diz se há vídeo, mas não entrega o identificador: quem está só
    // navegando não precisa dele.
    const comMarca = conteudos.map(({ videoId, ...resto }) => ({
      ...resto,
      temVideo: videoId !== null,
    }));

    // Filtrar por objetivo em JSON dá consulta complicada; com o catálogo
    // limitado a 100 itens, é mais simples (e rápido) filtrar aqui.
    if (!filtros.objetivo) return comMarca;

    const objetivo = filtros.objetivo;
    return comMarca.filter((conteudo) => {
      const objetivos = conteudo.objetivos as Record<string, number> | null;
      return (objetivos?.[objetivo] ?? 0) > 0;
    });
  }

  /** Modalidades que têm pelo menos uma aula aprovada, para montar os filtros. */
  async modalidades(): Promise<string[]> {
    const linhas = await this.prisma.content.findMany({
      where: { status: 'APROVADO' },
      distinct: ['modalidade'],
      orderBy: { modalidade: 'asc' },
      select: { modalidade: true },
    });
    return linhas.map((linha) => linha.modalidade);
  }

  async detalhar(id: string) {
    const conteudo = await this.prisma.content.findFirst({
      where: { id, status: 'APROVADO' },
      select: {
        id: true,
        titulo: true,
        modalidade: true,
        duracaoMin: true,
        nivelTecnico: true,
        demandaFisica: true,
        area: true,
        capaUrl: true,
        professor: true,
        videoProvedor: true,
        videoId: true,
        objetivos: true,
        trilhaId: true,
        ordemTrilha: true,
      },
    });

    if (!conteudo) throw new NotFoundException('Aula não encontrada');
    return conteudo;
  }
}
