/**
 * Dicas rápidas do Aprender (EDU-06).
 *
 * Trocam sozinhas a cada dia — sempre a mesma para o mesmo dia, para o texto
 * não mudar enquanto a pessoa olha a tela.
 *
 * Seguem a seção 9 do plano, e isso muda bastante a redação: nada aqui diz que
 * uma prática causa um resultado. "Costuma acompanhar", "a tradição descreve",
 * "é o que se observa" — e nunca "reduz o estresse" ou "melhora o sono". O que
 * é leitura ayurvédica está dito como tal.
 *
 * IMPORTANTE: precisam da revisão do Marcos antes de ir ao ar para alunos.
 */

export interface Dica {
  texto: string;
  /** De onde vem a afirmação, para a pessoa saber o peso dela. */
  fonte: 'Fisiologia' | 'Tradição do Yoga' | 'Visão Ayurvédica' | 'Prática';
}

export const dicas: Dica[] = [
  {
    texto:
      'Expirações mais longas que as inspirações costumam acompanhar um estado de maior quietude.',
    fonte: 'Fisiologia',
  },
  {
    texto: 'Antes de aprofundar uma postura, veja se a respiração continua tranquila.',
    fonte: 'Prática',
  },
  {
    texto:
      'A tradição descreve o prāṇāyāma como o quarto dos oito passos — depois das posturas, não antes.',
    fonte: 'Tradição do Yoga',
  },
  {
    texto: 'Na leitura ayurvédica, o fim da tarde costuma ser associado ao período de Vāta.',
    fonte: 'Visão Ayurvédica',
  },
  {
    texto: 'A coluna gira mais na região torácica do que na lombar.',
    fonte: 'Fisiologia',
  },
  {
    texto: 'Praticar pouco e sempre tende a sustentar mais do que praticar muito de vez em quando.',
    fonte: 'Prática',
  },
  {
    texto: '"Yoga é a quietude dos movimentos da mente" — a definição está no segundo verso.',
    fonte: 'Tradição do Yoga',
  },
  {
    texto: 'Na tradição ayurvédica, a digestão é descrita como o centro do bem-estar.',
    fonte: 'Visão Ayurvédica',
  },
  {
    texto: 'Depois de uma refeição completa, torções e invertidas costumam incomodar.',
    fonte: 'Prática',
  },
  {
    texto: 'O diafragma é um músculo: ele se cansa e também se educa.',
    fonte: 'Fisiologia',
  },
  {
    texto: 'Śavāsana não é o intervalo da prática — é parte dela.',
    fonte: 'Tradição do Yoga',
  },
  {
    texto: 'Dor aguda é sinal de parar. Desconforto que passa com a respiração, não.',
    fonte: 'Prática',
  },
  {
    texto: 'Alongar não é o mesmo que ganhar mobilidade: mobilidade envolve força no fim do arco.',
    fonte: 'Fisiologia',
  },
  {
    texto: 'Na leitura ayurvédica, alimentos quentes e simples são associados à estação fria.',
    fonte: 'Visão Ayurvédica',
  },
  {
    texto: 'Os oito passos do Yoga começam fora do tapete, nos yamas e niyamas.',
    fonte: 'Tradição do Yoga',
  },
];

/** O dia do calendário, para a dica andar junto com a data. */
function diaDoCalendario(agora: Date): number {
  return Math.floor(
    new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime() / 86_400_000,
  );
}

export function dicaDoDia(agora: Date = new Date()): Dica {
  // Passo ímpar e primo em relação ao tamanho da lista, para percorrer tudo
  // antes de repetir em vez de pular sempre para os mesmos lugares.
  const posicao = (diaDoCalendario(agora) * 11) % dicas.length;
  return dicas[posicao] as Dica;
}
