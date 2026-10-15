/**
 * Cursos fictícios para o Aprender (EDU-01 a EDU-04).
 *
 * Mesma natureza do catálogo de práticas: é material de desenvolvimento, para
 * a tela ter o que mostrar enquanto os professores não cadastram o conteúdo de
 * verdade. Os vídeos não existem — as aulas entram sem mídia, e a tela diz
 * isso em vez de fingir um player.
 *
 * Os textos seguem a seção 9 do plano: não afirmam causa ("ajuda a", "costuma
 * acompanhar", e não "reduz"), e o que é leitura ayurvédica está identificado
 * como tal. Precisam da revisão do Marcos antes de ir para alunos de verdade.
 */

export interface AulaDeTeste {
  titulo: string;
  descricao: string;
  tipo: 'video' | 'audio' | 'texto';
  duracaoMin: number;
}

export interface CursoDeTeste {
  id: string;
  titulo: string;
  descricao: string;
  tema: 'fisiologia' | 'filosofia' | 'yoga' | 'ayurveda' | 'classicos';
  nivel: number;
  professor: string;
  aulas: AulaDeTeste[];
}

export const CURSOS_DE_TESTE: CursoDeTeste[] = [
  {
    id: 'CURSO-001',
    titulo: 'Respiração e sistema nervoso',
    descricao:
      'O que a ciência observa sobre a respiração lenta e o estado de alerta do corpo, e como isso aparece no prāṇāyāma.',
    tema: 'fisiologia',
    nivel: 1,
    professor: 'Marcos Crozetta',
    aulas: [
      {
        titulo: 'Como respiramos',
        descricao: 'Diafragma, caixa torácica e o que muda entre respirar parado e em movimento.',
        tipo: 'video',
        duracaoMin: 12,
      },
      {
        titulo: 'O nervo vago em poucas palavras',
        descricao: 'O caminho que liga a respiração ao ritmo do coração, sem promessas.',
        tipo: 'video',
        duracaoMin: 14,
      },
      {
        titulo: 'Respiração lenta: o que se observa',
        descricao: 'O que os estudos mostram, o que ainda é incerto e o que não dá para afirmar.',
        tipo: 'texto',
        duracaoMin: 8,
      },
      {
        titulo: 'Levando para o tapete',
        descricao: 'Como essa leitura muda a forma de conduzir um prāṇāyāma.',
        tipo: 'video',
        duracaoMin: 11,
      },
    ],
  },
  {
    id: 'CURSO-002',
    titulo: 'Yoga Sūtras: primeiros passos',
    descricao: 'Uma leitura comentada dos primeiros versos, sem sânscrito prévio.',
    tema: 'filosofia',
    nivel: 2,
    professor: 'Lerrita Crozetta',
    aulas: [
      {
        titulo: 'O que são os Sūtras',
        descricao: 'Quando foram escritos, por quem e para quem.',
        tipo: 'video',
        duracaoMin: 15,
      },
      {
        titulo: 'Atha yogānuśāsanam',
        descricao: 'O primeiro verso e o peso da palavra "agora".',
        tipo: 'video',
        duracaoMin: 13,
      },
      {
        titulo: 'Yogaś citta-vṛtti-nirodhaḥ',
        descricao: 'A definição mais citada do Yoga, verso a verso.',
        tipo: 'video',
        duracaoMin: 18,
      },
      {
        titulo: 'Citta e vṛttis',
        descricao: 'Os movimentos da mente e as cinco formas que o texto descreve.',
        tipo: 'video',
        duracaoMin: 16,
      },
      {
        titulo: 'Leitura acompanhada',
        descricao: 'Os quatro versos juntos, com o texto na tela.',
        tipo: 'texto',
        duracaoMin: 10,
      },
    ],
  },
  {
    id: 'CURSO-003',
    titulo: 'Introdução ao Ayurveda',
    descricao:
      'Os conceitos básicos da tradição ayurvédica, apresentados como leitura tradicional — não como diagnóstico.',
    tema: 'ayurveda',
    nivel: 1,
    professor: 'Marcos Crozetta',
    aulas: [
      {
        titulo: 'De onde vem o Ayurveda',
        descricao: 'A origem dos textos e o lugar deles hoje.',
        tipo: 'video',
        duracaoMin: 12,
      },
      {
        titulo: 'Os três doṣas',
        descricao: 'Vāta, Pitta e Kapha na descrição tradicional, sem porcentagens.',
        tipo: 'video',
        duracaoMin: 17,
      },
      {
        titulo: 'Rotina e estações',
        descricao: 'O que a tradição sugere sobre horários e mudanças do ano.',
        tipo: 'texto',
        duracaoMin: 9,
      },
      {
        titulo: 'O que o Ayurveda não é',
        descricao: 'Os limites da leitura tradicional e quando procurar avaliação médica.',
        tipo: 'video',
        duracaoMin: 10,
      },
    ],
  },
  {
    id: 'CURSO-004',
    titulo: 'História e escolas do Yoga',
    descricao: 'De onde vêm Hatha, Ashtanga, Vinyasa e Yin, e o que separa uma da outra.',
    tema: 'yoga',
    nivel: 1,
    professor: 'Lerrita Crozetta',
    aulas: [
      {
        titulo: 'Antes do tapete',
        descricao: 'O Yoga que existia muito antes das posturas.',
        tipo: 'video',
        duracaoMin: 14,
      },
      {
        titulo: 'O Hatha e o corpo',
        descricao: 'Quando a postura entra em cena, e por quê.',
        tipo: 'video',
        duracaoMin: 16,
      },
      {
        titulo: 'As escolas modernas',
        descricao: 'Ashtanga, Vinyasa, Yin e Restaurativo lado a lado.',
        tipo: 'video',
        duracaoMin: 19,
      },
    ],
  },
  {
    id: 'CURSO-005',
    titulo: 'Bhagavad Gītā: leitura comentada',
    descricao: 'Uma travessia pelos capítulos centrais, com o texto sempre à vista.',
    tema: 'classicos',
    nivel: 3,
    professor: 'Lerrita Crozetta',
    aulas: [
      {
        titulo: 'O campo de batalha',
        descricao: 'O cenário do poema e por que ele é uma imagem, não uma guerra.',
        tipo: 'video',
        duracaoMin: 20,
      },
      {
        titulo: 'Karma yoga',
        descricao: 'A ação sem apego ao resultado, no texto e fora dele.',
        tipo: 'video',
        duracaoMin: 22,
      },
      {
        titulo: 'Bhakti e jñāna',
        descricao: 'Os outros dois caminhos que o poema descreve.',
        tipo: 'video',
        duracaoMin: 21,
      },
      {
        titulo: 'Os versos em português',
        descricao: 'Tradução comentada dos trechos vistos no curso.',
        tipo: 'texto',
        duracaoMin: 14,
      },
    ],
  },
  {
    id: 'CURSO-006',
    titulo: 'Anatomia da coluna para a prática',
    descricao: 'O que acontece na coluna nas flexões, extensões e torções mais comuns.',
    tema: 'fisiologia',
    nivel: 2,
    professor: 'Marcos Crozetta',
    aulas: [
      {
        titulo: 'As curvas naturais',
        descricao: 'Cervical, torácica e lombar: o que cada uma faz.',
        tipo: 'video',
        duracaoMin: 13,
      },
      {
        titulo: 'Flexão e extensão',
        descricao: 'Onde o movimento acontece e onde ele costuma se concentrar demais.',
        tipo: 'video',
        duracaoMin: 15,
      },
      {
        titulo: 'Torções com cuidado',
        descricao: 'O que observar antes de torcer, e quando não torcer.',
        tipo: 'video',
        duracaoMin: 12,
      },
    ],
  },
];
