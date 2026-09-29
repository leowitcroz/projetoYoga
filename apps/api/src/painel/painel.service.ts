import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Papel } from '../auth/papeis.guard.js';
import type { ConteudoDto } from './dto/conteudo.dto.js';

/**
 * Catálogo pelo lado de quem cataloga (ADM-02, ADM-03, ADM-06).
 *
 * Duas regras atravessam tudo aqui:
 *  - o professor mexe no que é dele; o master e o admin veem tudo;
 *  - só o master aprova, e ninguém aprova o próprio conteúdo.
 */
@Injectable()
export class PainelService {
  constructor(private readonly prisma: PrismaService) {}

  private podeVerTudo(papel: Papel): boolean {
    return papel === 'MASTER' || papel === 'ADMIN';
  }

  listar(usuarioId: string, papel: Papel, status?: string) {
    return this.prisma.content.findMany({
      where: {
        ...(this.podeVerTudo(papel) ? {} : { autorId: usuarioId }),
        ...(status ? { status: status as never } : {}),
      },
      orderBy: { atualizadoEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        modalidade: true,
        duracaoMin: true,
        nivelTecnico: true,
        status: true,
        comentarioRevisao: true,
        atualizadoEm: true,
        autor: { select: { nome: true } },
      },
    });
  }

  /** Fila do master: o que está esperando revisão (F3.9). */
  fila() {
    return this.prisma.content.findMany({
      where: { status: 'EM_REVISAO' },
      orderBy: { atualizadoEm: 'asc' },
      select: {
        id: true,
        titulo: true,
        modalidade: true,
        duracaoMin: true,
        atualizadoEm: true,
        autor: { select: { nome: true } },
      },
    });
  }

  async buscar(id: string, usuarioId: string, papel: Papel) {
    const conteudo = await this.prisma.content.findUnique({ where: { id } });
    if (!conteudo) throw new NotFoundException('Prática não encontrada');

    if (!this.podeVerTudo(papel) && conteudo.autorId !== usuarioId) {
      throw new ForbiddenException('Esta prática é de outro professor');
    }
    return conteudo;
  }

  async criar(usuarioId: string, dados: ConteudoDto) {
    const id = await this.gerarId();

    return this.prisma.content.create({
      data: {
        id,
        autorId: usuarioId,
        status: 'RASCUNHO',
        tipo: 'pratica',
        ...this.paraColunas(dados),
      },
      select: { id: true, titulo: true, status: true },
    });
  }

  async atualizar(id: string, usuarioId: string, papel: Papel, dados: ConteudoDto) {
    const atual = await this.buscar(id, usuarioId, papel);

    // ADM-06: mexer num conteúdo aprovado exige nova revisão. A versão que já
    // está no ar continua valendo até o master aprovar a mudança — por isso o
    // status volta para "em revisão", e não para rascunho.
    const status = atual.status === 'APROVADO' ? 'EM_REVISAO' : atual.status;

    return this.prisma.content.update({
      where: { id },
      data: { ...this.paraColunas(dados), status },
      select: { id: true, titulo: true, status: true },
    });
  }

  async enviarParaRevisao(id: string, usuarioId: string, papel: Papel) {
    const conteudo = await this.buscar(id, usuarioId, papel);
    if (conteudo.status === 'EM_REVISAO') {
      throw new BadRequestException('Esta prática já está na fila de revisão');
    }

    return this.prisma.content.update({
      where: { id },
      data: { status: 'EM_REVISAO', comentarioRevisao: null },
      select: { id: true, status: true },
    });
  }

  /** Só o master aprova, e nunca o próprio conteúdo (ADM-06). */
  async aprovar(id: string, usuarioId: string) {
    const conteudo = await this.prisma.content.findUnique({ where: { id } });
    if (!conteudo) throw new NotFoundException('Prática não encontrada');

    if (conteudo.autorId === usuarioId) {
      throw new ForbiddenException('Peça a outro professor master para revisar a sua prática');
    }
    if (conteudo.status !== 'EM_REVISAO') {
      throw new BadRequestException('Só é possível aprovar o que está em revisão');
    }

    return this.prisma.content.update({
      where: { id },
      data: { status: 'APROVADO', comentarioRevisao: null },
      select: { id: true, status: true },
    });
  }

  async devolver(id: string, usuarioId: string, comentario: string) {
    const conteudo = await this.prisma.content.findUnique({ where: { id } });
    if (!conteudo) throw new NotFoundException('Prática não encontrada');

    if (conteudo.autorId === usuarioId) {
      throw new ForbiddenException('Peça a outro professor master para revisar a sua prática');
    }

    return this.prisma.content.update({
      where: { id },
      data: { status: 'DEVOLVIDO', comentarioRevisao: comentario },
      select: { id: true, status: true, comentarioRevisao: true },
    });
  }

  /** Ids no formato do catálogo: PRAT-001, PRAT-002... */
  private async gerarId(): Promise<string> {
    const ultimo = await this.prisma.content.findFirst({
      where: { id: { startsWith: 'PRAT-' } },
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    const numero = ultimo ? Number(ultimo.id.replace('PRAT-', '')) + 1 : 1;
    return `PRAT-${String(numero).padStart(3, '0')}`;
  }

  private paraColunas(dados: ConteudoDto) {
    return {
      titulo: dados.titulo.trim(),
      modalidade: dados.modalidade,
      area: dados.area,
      duracaoMin: dados.duracaoMin,
      nivelTecnico: dados.nivelTecnico,
      demandaFisica: dados.demandaFisica,
      professor: dados.professor?.trim() ?? null,
      capaUrl: dados.capaUrl?.trim() ?? null,
      objetivos: this.somenteNumeros(dados.objetivos, 5),
      caracteristicas: { ...dados.caracteristicas } as Record<string, number>,
      // Sem chaves com `undefined`: o Prisma só aceita JSON de verdade.
      seguranca: JSON.parse(JSON.stringify(dados.seguranca)) as Record<string, number | boolean>,
      ayurveda: dados.ayurveda ? this.somenteNumeros(dados.ayurveda, 3) : undefined,
      trilhaId: dados.trilhaId?.trim() || null,
      ordemTrilha: dados.ordemTrilha ?? null,
    };
  }

  /** Descarta o que não é número e o que está fora da escala. */
  private somenteNumeros(valores: Record<string, number>, maximo: number): Record<string, number> {
    const limpo: Record<string, number> = {};
    for (const [chave, valor] of Object.entries(valores)) {
      if (typeof valor === 'number' && valor > 0 && valor <= maximo)
        limpo[chave] = Math.round(valor);
    }
    return limpo;
  }
}
