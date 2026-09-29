import type {
  Candidato,
  Conteudo,
  ContextoUsuario,
  Exclusao,
  PraticaRecomendada,
  ResultadoDia,
} from '@life/shared';
import { CONFIG_V1, type EngineConfig } from './configuracao.js';
import { estadoFuncional, perfilDoDia, periodoDoDia } from './estado.js';
import { avisoDeDor, explicar } from './explicacao.js';
import { duracaoIdealMinima, filtrarPorTempoENivel } from './filtros.js';
import { aplicarModificadores } from './modificadores.js';
import { avisoDePersistencia, filtrarPorSeguranca } from './seguranca.js';
import { arredondar, calcularScoreBase } from './score.js';

export interface OpcoesDoMotor {
  /** Relógio de referência. Recebido de fora para o motor ser determinístico. */
  agora?: Date;
  /** Semente da descoberta (MOT-07). */
  semente?: number;
  config?: EngineConfig;
}

/**
 * Função pública do Motor LIFE (F1.17).
 *
 * Roda as etapas da aba 08 da Matriz, na ordem:
 *   1. segurança  → 2. tempo → 3. nível → 4. score → 5. modificadores
 *   → 6. principal + alternativa
 *
 * É uma função pura: sem banco, sem HTTP, sem relógio próprio. A mesma
 * entrada devolve sempre a mesma saída.
 */
export function recomendarDia(
  contexto: ContextoUsuario,
  catalogo: Conteudo[],
  opcoes: OpcoesDoMotor = {},
): ResultadoDia {
  const config = opcoes.config ?? CONFIG_V1;
  const agora = opcoes.agora ?? new Date();
  const periodo = periodoDoDia(agora);

  // Etapa 1 — segurança. Nada volta depois daqui (SEG-R01).
  const seguranca = filtrarPorSeguranca(catalogo, contexto, config);
  const exclusoes: Exclusao[] = [...seguranca.exclusoes];

  // Etapas 2 e 3 — tempo e nível técnico.
  const filtrados = filtrarPorTempoENivel(seguranca.seguros, contexto, config);
  exclusoes.push(...filtrados.exclusoes);

  // Estado do dia, que alimenta o score.
  const { perfil: pedidoDoDia } = perfilDoDia(contexto.checkin, periodo, config);
  const estado = estadoFuncional(contexto.checkin, pedidoDoDia, periodo);

  // Etapas 4 e 5 — score base e modificadores.
  const ranking: Candidato[] = filtrados.candidatos
    .map(({ conteudo, status }) => {
      const { criterios, total } = calcularScoreBase(conteudo, contexto, pedidoDoDia, config);
      const modificadores = aplicarModificadores(conteudo, status, contexto, config, agora);
      const ajuste = modificadores.reduce((soma, item) => soma + item.pontos, 0);

      return {
        conteudo,
        statusSeguranca: status,
        criterios,
        scoreBase: total,
        modificadores,
        scoreFinal: arredondar(Math.max(0, total + ajuste)),
      };
    })
    // Empate desempatado pelo id, para a saída nunca depender da ordem do catálogo.
    .sort((a, b) => b.scoreFinal - a.scoreFinal || a.conteudo.id.localeCompare(b.conteudo.id));

  // Etapa 6 — principal e alternativa de natureza diferente (MOT-08).
  const principal = ranking[0];
  const alternativa = principal ? escolherAlternativa(ranking, principal) : undefined;

  const auditoria = {
    versaoConfig: config.versao,
    estadoFuncional: estado,
    modoConservador: seguranca.modoConservador,
    totalNoCatalogo: catalogo.length,
    candidatosConsiderados: ranking.length,
    exclusoes,
    ranking,
    persistencia: avisoDePersistencia(contexto, config),
    ajusteDeTempo: avisoDeTempo(principal, contexto, config),
  };

  return {
    principal: principal ? montar(principal, contexto, estado) : undefined,
    alternativa: alternativa ? montar(alternativa, contexto, estado) : undefined,
    estadoFuncional: estado,
    // A pessoa precisa saber tanto da dor quanto de a prática ter vindo mais
    // curta do que o tempo que ela reservou.
    aviso: [avisoDeDor(contexto), auditoria.ajusteDeTempo].filter(Boolean).join(' ') || undefined,
    auditoria,
  };
}

/**
 * Quando a prática escolhida é bem mais curta que o tempo reservado, a pessoa
 * merece saber por quê — senão parece que o app ignorou o que ela respondeu.
 */
function avisoDeTempo(
  principal: Candidato | undefined,
  contexto: ContextoUsuario,
  config: EngineConfig,
): string | undefined {
  if (!principal) return undefined;

  const ideal = duracaoIdealMinima(contexto.checkin.tempo, config);
  if (principal.conteudo.duracaoMin >= ideal) return undefined;

  return `Você tem ${contexto.checkin.tempo} minutos, mas hoje o indicado é uma prática de ${principal.conteudo.duracaoMin}. O tempo que sobrar é seu.`;
}

/**
 * A alternativa precisa ser de outra natureza (MOT-08): outra modalidade ou,
 * não havendo, uma demanda física bem diferente. Oferecer duas variações da
 * mesma coisa não é escolha.
 */
function escolherAlternativa(ranking: Candidato[], principal: Candidato): Candidato | undefined {
  const outraModalidade = ranking.find(
    (item) => item.conteudo.modalidade !== principal.conteudo.modalidade,
  );
  if (outraModalidade) return outraModalidade;

  return ranking.find(
    (item) =>
      item.conteudo.id !== principal.conteudo.id &&
      Math.abs(item.conteudo.demandaFisica - principal.conteudo.demandaFisica) >= 2,
  );
}

function montar(
  candidato: Candidato,
  contexto: ContextoUsuario,
  estado: ResultadoDia['estadoFuncional'],
): PraticaRecomendada {
  return {
    conteudo: candidato.conteudo,
    scoreFinal: candidato.scoreFinal,
    explicacao: explicar(candidato, contexto, estado),
  };
}
