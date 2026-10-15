import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FiltrosDeCursosDto } from './dto/filtros-de-cursos.dto.js';

/** O que o app recebe de cada aula. Nunca o texto inteiro numa lista. */
const RESUMO_DA_AULA = {
  id: true,
  titulo: true,
  ordem: true,
  tipo: true,
  duracaoMin: true,
} as const;

const RESUMO_DO_CURSO = {
  id: true,
  titulo: true,
  descricao: true,
  tema: true,
  nivel: true,
  capaUrl: true,
  professor: true,
} as const;

/**
 * O Aprender (EDU-01 a EDU-06).
 *
 * Conhecimento tem uma diferença grande em relação à prática: aqui não existe
 * recomendação por estado do dia nem filtro de segurança. Ninguém se machuca
 * assistindo a uma aula de filosofia, então o motor não entra — o que manda é
 * onde a pessoa parou e o que ela disse querer estudar.
 */
@Injectable()
export class AprenderService {
  constructor(private readonly prisma: PrismaService) {}

  /** Catálogo de cursos, com filtros (EDU-01). */
  async listarCursos(filtros: FiltrosDeCursosDto) {
    const where: Record<string, unknown> = { status: 'APROVADO' };
    if (filtros.tema) where.tema = filtros.tema;
    if (filtros.nivel) where.nivel = filtros.nivel;
    if (filtros.busca) where.titulo = { contains: filtros.busca, mode: 'insensitive' };

    const cursos = await this.prisma.course.findMany({
      where,
      orderBy: [{ nivel: 'asc' }, { titulo: 'asc' }],
      take: 100,
      select: { ...RESUMO_DO_CURSO, aulas: { select: { tipo: true } } },
    });

    return cursos
      .map(({ aulas, ...curso }) => ({
        ...curso,
        totalAulas: aulas.length,
        tipos: [...new Set(aulas.map((aula) => aula.tipo))],
      }))
      // O filtro por tipo é sobre as aulas, não sobre o curso: "quero ler" quer
      // dizer "curso que tem aula de texto", e isso não dá para pedir ao banco
      // sem uma consulta bem mais complicada do que o catálogo merece.
      .filter((curso) => !filtros.tipo || curso.tipos.includes(filtros.tipo));
  }

  /** Os temas e níveis que existem no catálogo, para montar os filtros. */
  async filtrosDisponiveis() {
    const cursos = await this.prisma.course.findMany({
      where: { status: 'APROVADO' },
      select: { tema: true, nivel: true, aulas: { select: { tipo: true } } },
    });

    const temas: Record<string, number> = {};
    const niveis = new Set<number>();
    const tipos = new Set<string>();

    for (const curso of cursos) {
      temas[curso.tema] = (temas[curso.tema] ?? 0) + 1;
      niveis.add(curso.nivel);
      for (const aula of curso.aulas) tipos.add(aula.tipo);
    }

    return {
      total: cursos.length,
      temas,
      niveis: [...niveis].sort((a, b) => a - b),
      tipos: [...tipos].sort(),
    };
  }

  async detalharCurso(id: string, usuarioId: string) {
    const curso = await this.prisma.course.findFirst({
      where: { id, status: 'APROVADO' },
      select: {
        ...RESUMO_DO_CURSO,
        aulas: { orderBy: { ordem: 'asc' }, select: RESUMO_DA_AULA },
      },
    });
    if (!curso) throw new NotFoundException('Curso não encontrado');

    const concluidas = await this.concluidasDoCurso(usuarioId, id);

    return {
      ...curso,
      totalAulas: curso.aulas.length,
      concluidas: concluidas.size,
      aulas: curso.aulas.map((aula) => ({ ...aula, concluida: concluidas.has(aula.id) })),
    };
  }

  async detalharAula(id: string, usuarioId: string) {
    const aula = await this.prisma.lesson.findFirst({
      where: { id, curso: { status: 'APROVADO' } },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        ordem: true,
        tipo: true,
        duracaoMin: true,
        videoProvedor: true,
        videoId: true,
        texto: true,
        curso: { select: { id: true, titulo: true, professor: true, tema: true, nivel: true } },
      },
    });
    if (!aula) throw new NotFoundException('Aula não encontrada');

    const evento = await this.prisma.lessonEvent.findUnique({
      where: { userId_lessonId: { userId: usuarioId, lessonId: id } },
      select: { concluidaEm: true },
    });

    return { ...aula, concluida: evento !== null };
  }

  /** EDU-02: marcar como concluída. Repetir não duplica nem reinicia. */
  async concluirAula(id: string, usuarioId: string) {
    const aula = await this.prisma.lesson.findFirst({
      where: { id, curso: { status: 'APROVADO' } },
      select: { id: true },
    });
    if (!aula) throw new NotFoundException('Aula não encontrada');

    await this.prisma.lessonEvent.upsert({
      where: { userId_lessonId: { userId: usuarioId, lessonId: id } },
      create: { userId: usuarioId, lessonId: id },
      update: {},
    });

    return { concluida: true };
  }

  /**
   * A tela inicial do Aprender: tudo o que ela mostra, numa chamada só.
   *
   * São quatro perguntas diferentes sobre o mesmo catálogo; separadas em
   * quatro rotas, a tela faria quatro idas ao servidor para desenhar uma
   * dobra.
   */
  async inicio(usuarioId: string, dia: string) {
    const [doDia, continuar, recomendados] = await Promise.all([
      this.aulaDoDia(usuarioId, dia),
      this.continueEstudando(usuarioId),
      this.cursosRecomendados(usuarioId),
    ]);

    return { aulaDoDia: doDia, continueEstudando: continuar, recomendados };
  }

  /**
   * EDU-05 — a aula do dia.
   *
   * Sorteada, mas presa ao par pessoa + dia: a mesma durante o dia inteiro.
   * Sorteio a cada abertura faria o conteúdo trocar enquanto a pessoa olha a
   * tela, o que não parece sorteio, parece defeito.
   */
  async aulaDoDia(usuarioId: string, dia: string) {
    const aulas = await this.prisma.lesson.findMany({
      where: { curso: { status: 'APROVADO' } },
      orderBy: { id: 'asc' },
      select: {
        ...RESUMO_DA_AULA,
        descricao: true,
        videoId: true,
        curso: { select: { id: true, titulo: true, professor: true, tema: true, nivel: true, capaUrl: true } },
      },
    });
    if (aulas.length === 0) return null;

    const escolhida = aulas[this.sorteioEstavel(`${usuarioId}:${dia}`, aulas.length)];
    if (!escolhida) return null;

    const { videoId, ...resto } = escolhida;
    return { ...resto, temVideo: videoId !== null };
  }

  /**
   * EDU-03 — onde a pessoa parou.
   *
   * Vale o curso mexido mais recentemente, entre os que já têm pelo menos uma
   * aula concluída e ainda não acabaram. Curso terminado sai da lista: ficar
   * oferecendo "continuar" o que já foi concluído é cobrar à toa.
   */
  async continueEstudando(usuarioId: string) {
    const eventos = await this.prisma.lessonEvent.findMany({
      where: { userId: usuarioId },
      orderBy: { concluidaEm: 'desc' },
      select: { lessonId: true, aula: { select: { cursoId: true } } },
    });
    if (eventos.length === 0) return null;

    const concluidas = new Set(eventos.map((evento) => evento.lessonId));
    const cursosNaOrdem = [...new Set(eventos.map((evento) => evento.aula.cursoId))];

    for (const cursoId of cursosNaOrdem) {
      const curso = await this.prisma.course.findFirst({
        where: { id: cursoId, status: 'APROVADO' },
        select: {
          ...RESUMO_DO_CURSO,
          aulas: { orderBy: { ordem: 'asc' }, select: RESUMO_DA_AULA },
        },
      });
      if (!curso) continue;

      const proxima = curso.aulas.find((aula) => !concluidas.has(aula.id));
      if (!proxima) continue;

      const { aulas, ...dados } = curso;
      return {
        curso: dados,
        proxima,
        totalAulas: aulas.length,
        concluidas: aulas.filter((aula) => concluidas.has(aula.id)).length,
      };
    }

    return null;
  }

  /**
   * Cursos sugeridos (EDU-01).
   *
   * Saem dos temas que a pessoa marcou no cadastro. Quem não marcou nenhum
   * recebe os cursos mais curtos: é um começo honesto, e não uma lista
   * qualquer apresentada como escolhida para ela.
   */
  async cursosRecomendados(usuarioId: string) {
    const [perfil, jaComecados] = await Promise.all([
      this.prisma.onboardingProfile.findUnique({
        where: { userId: usuarioId },
        select: { temas: true },
      }),
      this.prisma.lessonEvent.findMany({
        where: { userId: usuarioId },
        select: { aula: { select: { cursoId: true } } },
      }),
    ]);

    const comecados = new Set(jaComecados.map((evento) => evento.aula.cursoId));
    const temas = (perfil?.temas ?? []).filter((tema) => tema.trim() !== '');

    const cursos = await this.prisma.course.findMany({
      where: {
        status: 'APROVADO',
        id: { notIn: comecados.size > 0 ? [...comecados] : ['-'] },
        ...(temas.length > 0 ? { tema: { in: temas } } : {}),
      },
      orderBy: [{ nivel: 'asc' }, { titulo: 'asc' }],
      take: 8,
      select: { ...RESUMO_DO_CURSO, aulas: { select: { id: true } } },
    });

    return {
      porTema: temas.length > 0,
      cursos: cursos.map(({ aulas, ...curso }) => ({ ...curso, totalAulas: aulas.length })),
    };
  }

  private async concluidasDoCurso(usuarioId: string, cursoId: string): Promise<Set<string>> {
    const eventos = await this.prisma.lessonEvent.findMany({
      where: { userId: usuarioId, aula: { cursoId } },
      select: { lessonId: true },
    });
    return new Set(eventos.map((evento) => evento.lessonId));
  }

  /** Mesma semente, mesmo resultado — é o que prende o sorteio ao dia. */
  private sorteioEstavel(semente: string, tamanho: number): number {
    let valor = 0;
    for (const letra of semente) valor = (valor * 31 + letra.charCodeAt(0)) % 2147483647;
    return valor % tamanho;
  }
}
