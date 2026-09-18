import {
  flowerOutline,
  happyOutline,
  heartOutline,
  nutritionOutline,
  sunnyOutline,
  walkOutline,
} from 'ionicons/icons';

/**
 * As seis perguntas do check-in diário (CHK-01), com três respostas cada.
 *
 * A ordem aqui é a ordem em que a pessoa responde no carrossel da aba Hoje.
 * O `valor` é o que o motor vai ler; o `rotulo` é o que aparece na tela.
 */
export interface OpcaoCheckin {
  valor: string;
  rotulo: string;
}

export interface PerguntaCheckin {
  id: ChaveCheckin;
  /** Nome curto, usado no resumo em grade. */
  nome: string;
  /** Pergunta inteira, usada no carrossel. */
  pergunta: string;
  icone: string;
  opcoes: [OpcaoCheckin, OpcaoCheckin, OpcaoCheckin];
}

export type ChaveCheckin = 'sono' | 'energia' | 'corpo' | 'estresse' | 'digestao' | 'humor';

export const perguntas: PerguntaCheckin[] = [
  {
    id: 'sono',
    nome: 'Sono',
    pergunta: 'Como foi o seu sono?',
    icone: happyOutline,
    opcoes: [
      { valor: 'ruim', rotulo: 'Ruim' },
      { valor: 'razoavel', rotulo: 'Razoável' },
      { valor: 'bom', rotulo: 'Bom' },
    ],
  },
  {
    id: 'energia',
    nome: 'Energia',
    pergunta: 'Como está a sua energia?',
    icone: sunnyOutline,
    opcoes: [
      { valor: 'baixa', rotulo: 'Baixa' },
      { valor: 'media', rotulo: 'Média' },
      { valor: 'alta', rotulo: 'Alta' },
    ],
  },
  {
    id: 'corpo',
    nome: 'Corpo',
    pergunta: 'Como o seu corpo está hoje?',
    icone: walkOutline,
    opcoes: [
      { valor: 'cansado', rotulo: 'Cansado' },
      { valor: 'normal', rotulo: 'Normal' },
      { valor: 'disposto', rotulo: 'Disposto' },
    ],
  },
  {
    id: 'estresse',
    nome: 'Estresse',
    pergunta: 'Como está o seu nível de estresse?',
    icone: flowerOutline,
    opcoes: [
      { valor: 'tranquilo', rotulo: 'Tranquilo' },
      { valor: 'um-pouco-alto', rotulo: 'Um pouco alto' },
      { valor: 'alto', rotulo: 'Alto' },
    ],
  },
  {
    id: 'digestao',
    nome: 'Digestão',
    pergunta: 'Como está a sua digestão?',
    icone: nutritionOutline,
    opcoes: [
      { valor: 'pesada', rotulo: 'Pesada' },
      { valor: 'normal', rotulo: 'Normal' },
      { valor: 'leve', rotulo: 'Leve' },
    ],
  },
  {
    id: 'humor',
    nome: 'Humor',
    pergunta: 'Como está o seu humor?',
    icone: heartOutline,
    opcoes: [
      { valor: 'abatido', rotulo: 'Abatido' },
      { valor: 'oscilando', rotulo: 'Oscilando' },
      { valor: 'equilibrado', rotulo: 'Equilibrado' },
    ],
  },
];

/** Quanto tempo a pessoa tem hoje, em minutos (CHK-01). */
export const temposDisponiveis = [10, 20, 30, 45, 60] as const;

export function rotuloDoTempo(minutos: number): string {
  return minutos === 60 ? '60+' : String(minutos);
}

export function rotuloDaResposta(id: ChaveCheckin, valor: string | undefined): string | undefined {
  const pergunta = perguntas.find((item) => item.id === id);
  return pergunta?.opcoes.find((opcao) => opcao.valor === valor)?.rotulo;
}
