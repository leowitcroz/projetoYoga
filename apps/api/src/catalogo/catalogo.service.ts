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
    if (filtros.area) where.area = filtros.area;
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

  /**
   * O que a biblioteca precisa para se montar (PRA-01).
   *
   * Devolve quantas aulas há em cada área e quais objetivos aparecem no
   * catálogo, com a contagem. A tela usa isso para não oferecer atalho que
   * leva a lista vazia: porta que não tem nada atrás é pior do que porta
   * nenhuma.
   */
  async biblioteca() {
    const conteudos = await this.prisma.content.findMany({
      where: { status: 'APROVADO' },
      select: { area: true, objetivos: true },
    });

    const porArea: Record<string, number> = {};
    const porObjetivo: Record<string, number> = {};

    for (const conteudo of conteudos) {
      porArea[conteudo.area] = (porArea[conteudo.area] ?? 0) + 1;

      const objetivos = (conteudo.objetivos ?? {}) as Record<string, number>;
      for (const [nome, peso] of Object.entries(objetivos)) {
        if (peso > 0) porObjetivo[nome] = (porObjetivo[nome] ?? 0) + 1;
      }
    }

    return { total: conteudos.length, areas: porArea, objetivos: porObjetivo };
  }

  /**
   * "Para você": as práticas que atendem o que a pessoa disse buscar (PRA-01).
   *
   * Vem do objetivo que ela escolheu no cadastro, não do check-in do dia —
   * aqui ela está navegando, não pedindo a prática de hoje. Quem não preencheu
   * o perfil não recebe uma lista genérica chamada "para você": recebe nada, e
   * a tela esconde a faixa.
   */
  async paraVoce(usuarioId: string) {
    const perfil = await this.prisma.onboardingProfile.findUnique({
      where: { userId: usuarioId },
      select: { objetivoPrincipal: true, objetivosSecundarios: true },
    });

    const principal = perfil?.objetivoPrincipal?.trim();
    if (!principal) return { objetivo: null, aulas: [] };

    const secundarios = (perfil?.objetivosSecundarios ?? []).filter((item) => item.trim() !== '');
    const desejados = [principal, ...secundarios];

    const conteudos = await this.prisma.content.findMany({
      where: { status: 'APROVADO' },
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

    // O peso do objetivo principal vale mais que o dos secundários: quem disse
    // que quer dormir melhor não deve receber primeiro uma aula de força que
    // por acaso também ajuda no sono.
    const comNota = conteudos
      .map((conteudo) => {
        const objetivos = (conteudo.objetivos ?? {}) as Record<string, number>;
        const nota = desejados.reduce((total, objetivo, posicao) => {
          const peso = objetivos[objetivo] ?? 0;
          return total + peso * (posicao === 0 ? 2 : 1);
        }, 0);
        return { conteudo, nota };
      })
      .filter((item) => item.nota > 0)
      .sort((a, b) => b.nota - a.nota)
      .slice(0, 8);

    return {
      objetivo: principal,
      aulas: comNota.map(({ conteudo }) => {
        const { videoId, ...resto } = conteudo;
        return { ...resto, temVideo: videoId !== null };
      }),
    };
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
        estrutura: true,
        trilhaId: true,
        ordemTrilha: true,
        trilha: { select: { nome: true } },
      },
    });

    if (!conteudo) throw new NotFoundException('Aula não encontrada');
    return conteudo;
  }
}
