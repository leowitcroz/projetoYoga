import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Papel } from '../auth/papeis.guard.js';
import type { TrilhaDto } from './dto/trilha.dto.js';

/** Quantas vezes insistir quando duas trilhas disputam o mesmo número. */
const TENTATIVAS_DE_ID = 5;

/**
 * Trilhas: práticas feitas para serem percorridas em ordem (ADM-05, F3.6).
 *
 * Duas decisões moldam tudo aqui:
 *
 *  - **a trilha é dona da ordem.** Ninguém digita a posição de uma aula; o
 *    painel manda a lista na ordem desejada e esta classe numera de 1 em
 *    diante. Buraco e repetição deixam de ser possíveis, e era justamente
 *    isso que fazia o motor perder a próxima aula em silêncio (PER-008);
 *  - **toda a equipe enxerga todas as trilhas, mas só o dono e o master
 *    mexem.** Uma trilha é a estrutura do catálogo, não um rascunho: um
 *    professor precisa vê-la para encaixar a aula dele nela.
 */
@Injectable()
export class TrilhasService {
  constructor(private readonly prisma: PrismaService) {}

  private ehMaster(papel: Papel): boolean {
    return papel === 'MASTER' || papel === 'ADMIN';
  }

  async listar() {
    const trilhas = await this.prisma.track.findMany({
      orderBy: { nome: 'asc' },
      include: {
        autor: { select: { nome: true } },
        preRequisito: { select: { id: true, nome: true } },
        aulas: { select: { status: true } },
      },
    });

    return trilhas.map((trilha) => ({
      id: trilha.id,
      nome: trilha.nome,
      descricao: trilha.descricao,
      totalAulas: trilha.totalAulas,
      aulasCadastradas: trilha.aulas.length,
      autor: trilha.autor,
      preRequisito: trilha.preRequisito,
      atualizadoEm: trilha.atualizadoEm,
      problemas: this.problemas(trilha.totalAulas, trilha.aulas),
    }));
  }

  async buscar(id: string) {
    const trilha = await this.prisma.track.findUnique({
      where: { id },
      include: {
        autor: { select: { nome: true } },
        preRequisito: { select: { id: true, nome: true } },
        aulas: {
          orderBy: { ordemTrilha: 'asc' },
          select: {
            id: true,
            titulo: true,
            modalidade: true,
            duracaoMin: true,
            status: true,
            ordemTrilha: true,
          },
        },
      },
    });
    if (!trilha) throw new NotFoundException('Trilha não encontrada');

    // Para o painel poder oferecer o que dá para acrescentar sem tirar aula
    // de outra trilha pelas costas de quem a montou.
    const disponiveis = await this.prisma.content.findMany({
      where: { trilhaId: null },
      orderBy: { titulo: 'asc' },
      select: { id: true, titulo: true, modalidade: true, duracaoMin: true, status: true },
    });

    return {
      ...trilha,
      problemas: this.problemas(trilha.totalAulas, trilha.aulas),
      disponiveis,
    };
  }

  /** Outras trilhas que podem ser pré-requisito desta, já sem as que fariam ciclo. */
  async possiveisPreRequisitos(id?: string) {
    const trilhas = await this.prisma.track.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, preRequisitoId: true },
    });

    if (!id) return trilhas.map(({ id: trilhaId, nome }) => ({ id: trilhaId, nome }));

    return trilhas
      .filter((trilha) => trilha.id !== id && !this.dependeDe(trilha.id, id, trilhas))
      .map(({ id: trilhaId, nome }) => ({ id: trilhaId, nome }));
  }

  async criar(usuarioId: string, dados: TrilhaDto) {
    // Numa trilha nova não há ciclo possível, mas o pré-requisito escolhido
    // precisa existir.
    await this.conferirPreRequisito('', dados.preRequisitoId);

    // O id é "o último TRILHA- mais um": duas pessoas criando ao mesmo tempo
    // escolhem o mesmo número. Pega o próximo livre em vez de dar erro.
    for (let tentativa = 0; tentativa < TENTATIVAS_DE_ID; tentativa++) {
      try {
        return await this.prisma.track.create({
          data: {
            id: await this.gerarId(),
            autorId: usuarioId,
            nome: dados.nome.trim(),
            descricao: dados.descricao?.trim() || null,
            totalAulas: dados.totalAulas,
            preRequisitoId: dados.preRequisitoId || null,
          },
          select: { id: true, nome: true },
        });
      } catch (problema) {
        if ((problema as { code?: string })?.code !== 'P2002') throw problema;
      }
    }

    throw new ConflictException('Muita gente criando trilha ao mesmo tempo. Tente de novo');
  }

  async atualizar(id: string, usuarioId: string, papel: Papel, dados: TrilhaDto) {
    await this.conferirQuemMexe(id, usuarioId, papel);
    await this.conferirPreRequisito(id, dados.preRequisitoId);

    return this.prisma.track.update({
      where: { id },
      data: {
        nome: dados.nome.trim(),
        descricao: dados.descricao?.trim() || null,
        totalAulas: dados.totalAulas,
        preRequisitoId: dados.preRequisitoId || null,
      },
      select: { id: true, nome: true },
    });
  }

  /**
   * Apagar a trilha solta as aulas, não as apaga.
   *
   * O banco já zera o `trilhaId` sozinho, mas a posição ficaria para trás —
   * uma prática avulsa marcada como "aula 3" de coisa nenhuma.
   */
  async remover(id: string, usuarioId: string, papel: Papel) {
    await this.conferirQuemMexe(id, usuarioId, papel);

    await this.prisma.$transaction([
      this.prisma.content.updateMany({
        where: { trilhaId: id },
        data: { trilhaId: null, ordemTrilha: null },
      }),
      this.prisma.track.delete({ where: { id } }),
    ]);

    return { removida: true };
  }

  /**
   * Define quais aulas a trilha tem e em que ordem.
   *
   * Recebe a lista inteira, não um movimento: assim a numeração é sempre
   * 1..n, e quem saiu da lista sai da trilha no mesmo passo.
   */
  async definirOrdem(id: string, usuarioId: string, papel: Papel, aulas: string[]) {
    await this.conferirQuemMexe(id, usuarioId, papel);

    const repetida = aulas.find((aula, indice) => aulas.indexOf(aula) !== indice);
    if (repetida) {
      throw new BadRequestException(`A prática ${repetida} aparece duas vezes na trilha`);
    }

    const encontradas = await this.prisma.content.findMany({
      where: { id: { in: aulas } },
      select: { id: true },
    });
    if (encontradas.length !== aulas.length) {
      const existe = new Set(encontradas.map((item) => item.id));
      const sumida = aulas.find((aula) => !existe.has(aula));
      throw new BadRequestException(`A prática ${sumida} não existe`);
    }

    await this.prisma.$transaction([
      // Quem estava na trilha e não está mais na lista volta a ser avulsa.
      this.prisma.content.updateMany({
        where: { trilhaId: id, id: { notIn: aulas.length > 0 ? aulas : ['-'] } },
        data: { trilhaId: null, ordemTrilha: null },
      }),
      ...aulas.map((aula, indice) =>
        this.prisma.content.update({
          where: { id: aula },
          data: { trilhaId: id, ordemTrilha: indice + 1 },
        }),
      ),
    ]);

    return this.buscar(id);
  }

  /** O que impede a trilha de chegar inteira ao aluno. */
  private problemas(totalAulas: number, aulas: { status: string }[]): string[] {
    const avisos: string[] = [];

    const faltam = totalAulas - aulas.length;
    if (faltam > 0) {
      avisos.push(
        faltam === 1
          ? 'Falta 1 aula para a trilha ficar completa'
          : `Faltam ${faltam} aulas para a trilha ficar completa`,
      );
    } else if (faltam < 0) {
      avisos.push(`A trilha tem ${-faltam} aula(s) a mais do que o previsto`);
    }

    const porAprovar = aulas.filter((aula) => aula.status !== 'APROVADO').length;
    if (porAprovar > 0) {
      avisos.push(
        porAprovar === 1
          ? '1 aula ainda não foi aprovada e não chega ao aluno'
          : `${porAprovar} aulas ainda não foram aprovadas e não chegam ao aluno`,
      );
    }

    return avisos;
  }

  private async conferirQuemMexe(id: string, usuarioId: string, papel: Papel) {
    const trilha = await this.prisma.track.findUnique({
      where: { id },
      select: { autorId: true },
    });
    if (!trilha) throw new NotFoundException('Trilha não encontrada');

    if (!this.ehMaster(papel) && trilha.autorId !== usuarioId) {
      throw new ForbiddenException('Esta trilha é de outro professor');
    }
    return trilha;
  }

  /**
   * O pré-requisito não pode voltar para a própria trilha.
   *
   * Sem isto, "A exige B" e "B exige A" entram as duas sem reclamar, e o
   * aluno fica com duas trilhas que nunca abrem.
   */
  private async conferirPreRequisito(id: string, preRequisitoId?: string) {
    if (!preRequisitoId) return;

    if (preRequisitoId === id) {
      throw new BadRequestException('Uma trilha não pode ser pré-requisito dela mesma');
    }

    const todas = await this.prisma.track.findMany({
      select: { id: true, nome: true, preRequisitoId: true },
    });

    const alvo = todas.find((trilha) => trilha.id === preRequisitoId);
    if (!alvo) throw new BadRequestException('A trilha escolhida como pré-requisito não existe');

    if (this.dependeDe(preRequisitoId, id, todas)) {
      throw new BadRequestException(
        `"${alvo.nome}" já depende desta trilha. Uma exigiria a outra para sempre, e nenhuma das duas abriria`,
      );
    }
  }

  /** `origem` chega a `procurada` subindo a corrente de pré-requisitos? */
  private dependeDe(
    origem: string,
    procurada: string,
    todas: { id: string; preRequisitoId: string | null }[],
  ): boolean {
    const vistas = new Set<string>();
    let atual: string | null = origem;

    while (atual && !vistas.has(atual)) {
      if (atual === procurada) return true;
      vistas.add(atual);
      atual = todas.find((trilha) => trilha.id === atual)?.preRequisitoId ?? null;
    }
    return false;
  }

  /** Ids no formato do catálogo: TRILHA-001, TRILHA-002... */
  private async gerarId(): Promise<string> {
    const trilhas = await this.prisma.track.findMany({ select: { id: true } });

    const maior = trilhas.reduce((maximo, trilha) => {
      const numero = /^TRILHA-(\d+)$/.exec(trilha.id);
      return numero ? Math.max(maximo, Number(numero[1])) : maximo;
    }, 0);

    return `TRILHA-${String(maior + 1).padStart(3, '0')}`;
  }
}
