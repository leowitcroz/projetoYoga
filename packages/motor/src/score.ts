import type { Conteudo, ContextoUsuario, PerfilDeEfeito, PontuacaoPorCriterio } from '@life/shared';
import type { EngineConfig } from './configuracao.js';
import { tetoTecnico } from './filtros.js';

/**
 * Etapa 4 — score base de 0 a 100 (MOT-06).
 *
 * Cada critério dá uma nota de 0 a 1 e é multiplicado pelo seu peso da aba 05
 * da Matriz. O que muda todo dia é o estado; o objetivo vem do cadastro e só
 * é revisto a cada 30–45 dias.
 */

/** Deixa um número entre 0 e 1. */
function entreZeroEUm(valor: number): number {
  return Math.max(0, Math.min(1, valor));
}

const DIMENSOES: (keyof PerfilDeEfeito)[] = [
  'intensidade',
  'mobilidade',
  'respiracaoCalma',
  'yogaNidra',
  'relaxamento',
  'ativacao',
];

/**
 * O quanto a prática entrega o que o dia pede.
 *
 * Multiplica o que o dia pede (positivo ou negativo) pelo que a prática
 * oferece em cada dimensão, e normaliza. Uma prática intensa num dia que
 * pede repouso pontua baixo; a mesma prática num dia de ativação pontua alto.
 */
export function notaDoEstado(conteudo: Conteudo, pedidoDoDia: PerfilDeEfeito): number {
  let soma = 0;
  let maximo = 0;

  for (const dimensao of DIMENSOES) {
    const pede = pedidoDoDia[dimensao];
    const oferece = conteudo.caracteristicas[dimensao];
    soma += pede * oferece;
    maximo += Math.abs(pede) * 5;
  }

  if (maximo === 0) return 0.5; // dia neutro: ninguém sai na frente por aqui
  // De [-1, 1] para [0, 1].
  return entreZeroEUm((soma / maximo + 1) / 2);
}

function notaDoObjetivoPrincipal(conteudo: Conteudo, contexto: ContextoUsuario): number {
  const objetivo = contexto.perfil.objetivoPrincipal;
  if (!objetivo) return 0.5;
  return entreZeroEUm((conteudo.objetivos[objetivo] ?? 0) / 5);
}

function notaDosSecundarios(conteudo: Conteudo, contexto: ContextoUsuario): number {
  const secundarios = contexto.perfil.objetivosSecundarios;
  if (secundarios.length === 0) return 0.5;

  const soma = secundarios.reduce(
    (total, objetivo) => total + (conteudo.objetivos[objetivo] ?? 0),
    0,
  );
  return entreZeroEUm(soma / (secundarios.length * 5));
}

/**
 * Perfil: a prática está no ponto certo para a experiência da pessoa?
 *
 * Conteúdo no teto do nível vale um pouco mais, mas só um pouco: experiência
 * amplia o repertório, não obriga a praticar sempre o mais difícil (SEG-R01).
 * Um praticante avançado num dia de cansaço precisa de uma prática simples, e
 * ela não pode ser punida por ser simples.
 */
function notaDoPerfil(conteudo: Conteudo, contexto: ContextoUsuario): number {
  const teto = tetoTecnico(contexto, conteudo);
  const distancia = teto - conteudo.nivelTecnico;
  if (distancia < 0) return 0; // acima do teto já foi filtrado (MOT-04)
  return entreZeroEUm(1 - distancia * 0.1);
}

/** AYU-010 a AYU-012: modificador secundário, nunca vence segurança. */
function notaDeAyurveda(conteudo: Conteudo, contexto: ContextoUsuario): number {
  const constituicao = contexto.perfil.constituicao;
  if (!constituicao || !conteudo.ayurvedaTags) return 0.5;
  return entreZeroEUm((conteudo.ayurvedaTags[constituicao] ?? 0) / 3);
}

/** PER-004: preferência ajuda a desempatar entre opções já adequadas. */
function notaDasPreferencias(conteudo: Conteudo, contexto: ContextoUsuario): number {
  const preferidas = contexto.perfil.modalidadesPreferidas;
  if (preferidas.length === 0) return 0.5;
  return preferidas.includes(conteudo.modalidade) ? 1 : 0.35;
}

/**
 * Histórico: o que a pessoa já praticou conta pouco (peso 5) e só depois de
 * algum volume. Conteúdo da mesma modalidade que ela costuma concluir sobe.
 */
function notaDoHistorico(conteudo: Conteudo, contexto: ContextoUsuario): number {
  if (contexto.historico.length === 0) return 0.5;

  const jaFez = contexto.historico.some((item) => item.conteudoId === conteudo.id);
  const mesmaTrilha =
    conteudo.trilhaId !== undefined &&
    contexto.historico.some((item) => item.trilhaId === conteudo.trilhaId);

  if (mesmaTrilha) return 1;
  return jaFez ? 0.4 : 0.6;
}

export function calcularScoreBase(
  conteudo: Conteudo,
  contexto: ContextoUsuario,
  pedidoDoDia: PerfilDeEfeito,
  config: EngineConfig,
): { criterios: PontuacaoPorCriterio; total: number } {
  const { pesos } = config;

  const criterios: PontuacaoPorCriterio = {
    estado: notaDoEstado(conteudo, pedidoDoDia) * pesos.estado,
    objetivoPrincipal: notaDoObjetivoPrincipal(conteudo, contexto) * pesos.objetivoPrincipal,
    objetivosSecundarios: notaDosSecundarios(conteudo, contexto) * pesos.objetivosSecundarios,
    perfil: notaDoPerfil(conteudo, contexto) * pesos.perfil,
    ayurveda: notaDeAyurveda(conteudo, contexto) * pesos.ayurveda,
    preferencias: notaDasPreferencias(conteudo, contexto) * pesos.preferencias,
    historico: notaDoHistorico(conteudo, contexto) * pesos.historico,
  };

  const total = Object.values(criterios).reduce((soma, valor) => soma + valor, 0);
  return { criterios, total: arredondar(total) };
}

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
