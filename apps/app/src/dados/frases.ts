/**
 * Frases da aba Hoje.
 *
 * São duas listas: a de acolhimento, que aparece logo abaixo da saudação, e a
 * de ditados, que fecha a tela. As duas trocam sozinhas a cada dia — sempre a
 * mesma frase para o mesmo dia, para a pessoa não ver o texto mudando enquanto
 * usa o app.
 *
 * IMPORTANTE: as traduções são livres e precisam da revisão do Marcos antes de
 * ir ao ar para alunos (ver pendência na seção 12 do plano).
 */

export interface Ditado {
  texto: string;
  fonte: string;
}

/** Aparece embaixo do "Bom dia, Fulano". */
export const acolhimentos: string[] = [
  'Que a sua prática de hoje te leve mais perto do que realmente importa.',
  'O tapete espera por você do jeito que você está hoje.',
  'Comece de onde você está, com o que você tem.',
  'Respirar com atenção já é praticar.',
  'Hoje não precisa ser melhor que ontem. Precisa ser seu.',
  'A prática constante vale mais que a prática perfeita.',
  'Seu corpo pede atenção, não desempenho.',
  'Desacelerar também é avançar.',
  'O que você faz todo dia importa mais do que o que você faz de vez em quando.',
  'Escute o corpo antes de escolher a prática.',
  'Chegar até aqui já é metade do caminho.',
  'Cada respiração é uma chance de recomeçar.',
  'Firmeza no esforço, leveza no resultado.',
  'Sem pressa, mas sem pausa.',
  'A calma é um lugar que se constrói todo dia.',
];

/** Fecha a tela, no cartão de baixo. */
export const ditados: Ditado[] = [
  { texto: 'Yoga é o aquietar das flutuações da mente.', fonte: 'Yoga Sūtra I.2' },
  {
    texto:
      'A prática se firma quando é cultivada por muito tempo, sem interrupção e com dedicação.',
    fonte: 'Yoga Sūtra I.14',
  },
  { texto: 'A postura deve ser estável e confortável.', fonte: 'Yoga Sūtra II.46' },
  {
    texto: 'Quando a respiração se aquieta, a mente se aquieta.',
    fonte: 'Haṭha Yoga Pradīpikā II.2',
  },
  { texto: 'Disciplina hoje, liberdade amanhã.', fonte: 'Tradição do Yoga' },
  { texto: 'Yoga é habilidade na ação.', fonte: 'Bhagavad Gītā II.50' },
  {
    texto: 'Para quem é moderado no comer, no dormir e no agir, o Yoga desfaz o sofrimento.',
    fonte: 'Bhagavad Gītā VI.17',
  },
  {
    texto: 'A mente inquieta é difícil de conter, mas se aquieta com prática e desapego.',
    fonte: 'Bhagavad Gītā VI.35',
  },
  {
    texto: 'Levante-se, desperte, e não pare até alcançar a meta.',
    fonte: 'Kaṭha Upaniṣad I.3.14',
  },
  {
    texto: 'Assim como a pessoa é o seu desejo, assim é a sua vontade; assim é o seu ato.',
    fonte: 'Bṛhadāraṇyaka Upaniṣad IV.4.5',
  },
  {
    texto: 'O Yoga não é para quem come demais, nem para quem jejua em excesso.',
    fonte: 'Bhagavad Gītā VI.16',
  },
  {
    texto: 'A amizade com os felizes e a compaixão com os que sofrem serenam a mente.',
    fonte: 'Yoga Sūtra I.33',
  },
  {
    texto: 'Quando um pensamento perturba, cultive o pensamento contrário.',
    fonte: 'Yoga Sūtra II.33',
  },
  { texto: 'O corpo é o primeiro instrumento da prática. Cuide dele.', fonte: 'Tradição do Yoga' },
  { texto: 'Onde está a atenção, está a vida.', fonte: 'Tradição do Yoga' },
  {
    texto: 'A saúde vem do equilíbrio entre os doṣas, o fogo digestivo, os tecidos e os sentidos.',
    fonte: 'Suśruta Saṃhitā (Ayurveda)',
  },
  {
    texto: 'O alimento certo, na hora certa, na medida certa, é remédio.',
    fonte: 'Tradição do Ayurveda',
  },
  { texto: 'A rotina regular é a base da saúde.', fonte: 'Tradição do Ayurveda (dinacaryā)' },
  { texto: 'Contentamento traz a maior das alegrias.', fonte: 'Yoga Sūtra II.42' },
  { texto: 'A prática constante afasta a dispersão.', fonte: 'Yoga Sūtra I.32' },
];

/** Número do dia (mesmo valor durante todo o dia, muda à meia-noite). */
function diaDoCalendario(agora: Date): number {
  const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.floor(meiaNoite.getTime() / 86400000);
}

export function acolhimentoDoDia(agora: Date = new Date()): string {
  return acolhimentos[diaDoCalendario(agora) % acolhimentos.length] as string;
}

export function ditadoDoDia(agora: Date = new Date()): Ditado {
  // Um passo diferente do acolhimento, para as duas frases não andarem juntas.
  const posicao = (diaDoCalendario(agora) * 7) % ditados.length;
  return ditados[posicao] as Ditado;
}

/** "Bom dia", "Boa tarde" ou "Boa noite", conforme o relógio do aparelho. */
export function saudacaoDaHora(agora: Date = new Date()): string {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
