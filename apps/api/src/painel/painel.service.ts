import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Papel } from '../auth/papeis.guard.js';
import type { ConteudoDto } from './dto/conteudo.dto.js';
import { lerVideo } from './video.js';

/** Quantas vezes insistir quando dois cadastros disputam o mesmo número. */
const TENTATIVAS_DE_ID = 5;

/** P2002 é o código do Prisma para chave única repetida. */
function ehIdRepetido(problema: unknown): boolean {
  return (problema as { code?: string })?.code === 'P2002';
}

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
        trilha: { select: { id: true, nome: true } },
        ordemTrilha: true,
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
    const trilha = await this.lugarNaTrilha(dados.trilhaId, null, null);
    const colunas = this.paraColunas(dados);

    // O id vem de "o último PRAT- mais um", então dois professores clicando
    // em "Nova prática" no mesmo instante escolhem o mesmo número e um deles
    // esbarra na chave duplicada. Em vez de devolver erro a quem não fez nada
    // de errado, pegamos o próximo livre e tentamos de novo.
    for (let tentativa = 0; tentativa < TENTATIVAS_DE_ID; tentativa++) {
      try {
        return await this.prisma.content.create({
          data: {
            id: await this.gerarId(),
            autorId: usuarioId,
            status: 'RASCUNHO',
            tipo: 'pratica',
            ...colunas,
            ...trilha,
          },
          select: { id: true, titulo: true, status: true },
        });
      } catch (problema) {
        if (!ehIdRepetido(problema)) throw problema;
      }
    }

    throw new ConflictException('Muita gente cadastrando ao mesmo tempo. Salve de novo');
  }

  async atualizar(id: string, usuarioId: string, papel: Papel, dados: ConteudoDto) {
    const atual = await this.buscar(id, usuarioId, papel);

    // ADM-06: mexer num conteúdo aprovado exige nova revisão. A versão que já
    // está no ar continua valendo até o master aprovar a mudança — por isso o
    // status volta para "em revisão", e não para rascunho.
    const status = atual.status === 'APROVADO' ? 'EM_REVISAO' : atual.status;
    const trilha = await this.lugarNaTrilha(dados.trilhaId, atual.trilhaId, atual.ordemTrilha);

    return this.prisma.content.update({
      where: { id },
      data: { ...this.paraColunas(dados), ...trilha, status },
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
    // O link do YouTube vira provedor + identificador. Link que não dá para
    // ler é recusado na hora, em vez de virar uma prática sem vídeo.
    const video = dados.videoUrl ? lerVideo(dados.videoUrl) : null;
    if (dados.videoUrl && !video) {
      throw new BadRequestException(
        'Não reconheci esse link do YouTube. Cole o endereço do vídeo, como https://youtu.be/xxxxxxxxxxx',
      );
    }

    return {
      titulo: dados.titulo.trim(),
      modalidade: dados.modalidade,
      area: dados.area,
      duracaoMin: dados.duracaoMin,
      nivelTecnico: dados.nivelTecnico,
      demandaFisica: dados.demandaFisica,
      professor: dados.professor?.trim() ?? null,
      capaUrl: dados.capaUrl?.trim() ?? null,
      videoProvedor: video?.provedor ?? null,
      videoId: video?.id ?? null,
      objetivos: this.somenteNumeros(dados.objetivos, 5),
      caracteristicas: { ...dados.caracteristicas } as Record<string, number>,
      // Sem chaves com `undefined`: o Prisma só aceita JSON de verdade.
      seguranca: JSON.parse(JSON.stringify(dados.seguranca)) as Record<string, number | boolean>,
      ayurveda: dados.ayurveda ? this.somenteNumeros(dados.ayurveda, 3) : undefined,
      estrutura: this.conferirEstrutura(dados),
    };
  }

  /**
   * Os blocos da prática têm de somar a duração (PRA-07).
   *
   * A tela do aluno mostra "Āsanas — 14 min" antes de ele começar. Se os
   * blocos somarem 25 numa prática de 28, a tela passa a mentir sobre a
   * própria aula, e é o tipo de erro que ninguém percebe olhando a ficha.
   */
  private conferirEstrutura(dados: ConteudoDto) {
    const blocos = dados.estrutura ?? [];
    if (blocos.length === 0) return undefined;

    const soma = blocos.reduce((total, bloco) => total + bloco.minutos, 0);
    if (soma !== dados.duracaoMin) {
      throw new BadRequestException(
        `Os blocos somam ${soma} min e a prática dura ${dados.duracaoMin} min. ` +
          'Ajuste os blocos ou a duração para os dois baterem.',
      );
    }

    const repetido = blocos.find(
      (bloco, indice) => blocos.findIndex((item) => item.tipo === bloco.tipo) !== indice,
    );
    if (repetido) {
      throw new BadRequestException(
        'Cada bloco aparece uma vez só. Some os minutos num bloco único',
      );
    }

    return blocos.map((bloco) => ({ tipo: bloco.tipo, minutos: bloco.minutos }));
  }

  /**
   * Onde a prática entra na trilha (ADM-05).
   *
   * A posição não é digitada: quem muda de trilha vai para o fim da fila, e
   * quem continua na mesma fica onde estava — salvar a ficha para corrigir o
   * título não pode reembaralhar a sequência que o professor montou.
   */
  private async lugarNaTrilha(
    escolhida: string | undefined,
    trilhaAtual: string | null,
    ordemAtual: number | null,
  ): Promise<{ trilhaId: string | null; ordemTrilha: number | null }> {
    const trilhaId = escolhida?.trim() || null;

    if (!trilhaId) return { trilhaId: null, ordemTrilha: null };
    if (trilhaId === trilhaAtual) return { trilhaId, ordemTrilha: ordemAtual };

    const trilha = await this.prisma.track.findUnique({
      where: { id: trilhaId },
      select: { id: true },
    });
    if (!trilha) throw new BadRequestException('Essa trilha não existe mais');

    const ultima = await this.prisma.content.findFirst({
      where: { trilhaId },
      orderBy: { ordemTrilha: 'desc' },
      select: { ordemTrilha: true },
    });

    return { trilhaId, ordemTrilha: (ultima?.ordemTrilha ?? 0) + 1 };
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
