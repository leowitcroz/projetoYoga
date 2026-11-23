import asanas from '@/assets/icones/praticas/asanas.png';
import pranayama from '@/assets/icones/praticas/pranayama.png';
import sentado from '@/assets/icones/praticas/meditacao.png';
import nidra from '@/assets/icones/praticas/nidra.png';
import kriyas from '@/assets/icones/praticas/kriyas.png';
import lotus from '@/assets/lotus.png';
import type { BlocoDaPratica } from '@/servicos/catalogo';

/**
 * Os blocos que uma prática pode ter (PRA-07).
 *
 * O nome e a descrição explicam o vocabulário — o que é um prāṇāyāma — e são
 * os mesmos para toda prática. Os minutos, esses vêm da ficha: quem sabe
 * quanto dura cada bloco é o professor que montou a aula.
 *
 * Os desenhos são os da marca (`assets/icones/praticas`), os mesmos das telas
 * de referência. Preparação e Meditação dividem o mesmo glifo, o da figura
 * sentada: o conjunto da marca só tem um, e as duas são práticas sentadas —
 * o que as separa na tela é a cor do círculo e o nome.
 */
export interface DescricaoDoBloco {
  nome: string;
  descricao: string;
  /** Endereço do desenho da marca, em `assets/icones/praticas`. */
  icone: string;
  tom: string;
}

export const BLOCOS: Record<string, DescricaoDoBloco> = {
  preparacao: {
    nome: 'Preparação',
    descricao: 'Acolher o corpo e a mente',
    icone: sentado,
    tom: 'rosa',
  },
  asanas: {
    nome: 'Āsanas',
    descricao: 'Posturas: mobilidade e força',
    icone: asanas,
    tom: 'verde',
  },
  pranayama: {
    nome: 'Prāṇāyāma',
    descricao: 'Respiração consciente',
    icone: pranayama,
    tom: 'azul',
  },
  meditacao: {
    nome: 'Meditação',
    descricao: 'Atenção e quietude',
    icone: lotus,
    tom: 'azul',
  },
  nidra: {
    nome: 'Yoga Nidra',
    descricao: 'Descanso guiado, deitado',
    icone: nidra,
    tom: 'azul',
  },
  relaxamento: {
    nome: 'Relaxamento',
    descricao: 'Integração e presença',
    icone: lotus,
    tom: 'dourado',
  },
  kriyas: {
    nome: 'Kriyās',
    descricao: 'Técnicas de limpeza',
    icone: kriyas,
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
