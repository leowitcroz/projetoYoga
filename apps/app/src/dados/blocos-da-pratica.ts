import {
  flowerOutline,
  heartOutline,
  leafOutline,
  moonOutline,
  sparklesOutline,
  waterOutline,
} from 'ionicons/icons';
import type { BlocoDaPratica } from '@/servicos/catalogo';

/**
 * Os blocos que uma prática pode ter (PRA-07).
 *
 * O nome e a descrição explicam o vocabulário — o que é um prāṇāyāma — e são
 * os mesmos para toda prática. Os minutos, esses vêm da ficha: quem sabe
 * quanto dura cada bloco é o professor que montou a aula.
 */
export interface DescricaoDoBloco {
  nome: string;
  descricao: string;
  icone: string;
  tom: string;
}

export const BLOCOS: Record<string, DescricaoDoBloco> = {
  preparacao: {
    nome: 'Preparação',
    descricao: 'Acolher o corpo e a mente',
    icone: heartOutline,
    tom: 'rosa',
  },
  asanas: {
    nome: 'Āsanas',
    descricao: 'Posturas: mobilidade e força',
    icone: flowerOutline,
    tom: 'verde',
  },
  pranayama: {
    nome: 'Prāṇāyāma',
    descricao: 'Respiração consciente',
    icone: waterOutline,
    tom: 'azul',
  },
  meditacao: {
    nome: 'Meditação',
    descricao: 'Atenção e quietude',
    icone: sparklesOutline,
    tom: 'azul',
  },
  nidra: {
    nome: 'Yoga Nidra',
    descricao: 'Descanso guiado, deitado',
    icone: moonOutline,
    tom: 'azul',
  },
  relaxamento: {
    nome: 'Relaxamento',
    descricao: 'Integração e presença',
    icone: leafOutline,
    tom: 'dourado',
  },
  kriyas: {
    nome: 'Kriyās',
    descricao: 'Técnicas de limpeza',
    icone: sparklesOutline,
    tom: 'dourado',
  },
};

export interface BlocoNaTela extends DescricaoDoBloco {
  tipo: string;
  minutos: number;
}

/**
 * Prepara a estrutura para a tela.
 *
 * Bloco de tipo desconhecido é descartado em vez de aparecer sem nome: a tela
 * mostrar "undefined – 5 min" é pior do que mostrar um bloco a menos.
 */
export function montarEstrutura(blocos?: BlocoDaPratica[] | null): BlocoNaTela[] {
  return (blocos ?? [])
    .map((bloco) => {
      const descricao = BLOCOS[bloco.tipo];
      return descricao ? { ...descricao, tipo: bloco.tipo, minutos: bloco.minutos } : null;
    })
    .filter((bloco): bloco is BlocoNaTela => bloco !== null);
}

/**
 * O "por que esta prática?" (MOT-09), quando ele existe.
 *
 * Só há explicação quando a prática aberta é a que o motor indicou hoje. Quem
 * chegou pela aba Praticar escolheu sozinho, e não recebeu indicação nenhuma:
 * mostrar um texto dizendo que recebeu seria falso.
 */
export function porqueDaPratica(
  aulaId: string | undefined,
  recomendada: { id: string; explicacao: string } | undefined,
): string | undefined {
  if (!aulaId || !recomendada || recomendada.id !== aulaId) return undefined;
  return recomendada.explicacao;
}
