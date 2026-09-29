import type {
  Conteudo,
  ContextoUsuario,
  Exclusao,
  NivelExperiencia,
  StatusSeguranca,
} from '@life/shared';
import type { EngineConfig } from './configuracao.js';

/**
 * Etapas 2 e 3 do fluxo (MOT-03, MOT-04): tempo e nível técnico.
 *
 * Vêm depois da segurança e antes do ranking. Também não se discute com
 * score: o que não cabe no tempo, não cabe.
 */

/** Até que nível técnico cada experiência abre (PER-003). */
const TETO_POR_EXPERIENCIA: Record<NivelExperiencia, number> = {
  nunca: 1,
  basico: 2,
  regular: 3,
  experiente: 5,
};

/** Quem nunca respondeu sobre a área começa pelo começo. */
const TETO_PADRAO = 1;

export function tetoTecnico(contexto: ContextoUsuario, conteudo: Conteudo): number {
  const nivel = contexto.perfil.experiencia[conteudo.area];
  return nivel ? TETO_POR_EXPERIENCIA[nivel] : TETO_PADRAO;
}

export interface Candidatura {
  conteudo: Conteudo;
  status: StatusSeguranca;
}

export interface ResultadoDosFiltros {
  candidatos: Candidatura[];
  exclusoes: Exclusao[];
  /** Preenchido quando foi preciso afrouxar a janela de tempo. */
  ajusteDeTempo?: string;
}

/** A faixa de duração aceita hoje (MOT-03). */
export function janelaDeTempo(
  minutos: number,
  config: EngineConfig,
): { minimo: number; maximo: number } {
  const { tolerancia, aberturaAPartirDe } = config.tempo;

  return {
    minimo: Math.max(0, minutos - tolerancia),
    // O último degrau da tela é "60+": ali não existe teto.
    maximo: minutos >= aberturaAPartirDe ? Number.POSITIVE_INFINITY : minutos + tolerancia,
  };
}

/**
 * Tempo e nível.
 *
 * O tempo escolhido é uma janela, não um teto: quem separou 30 minutos quer
 * uma prática de 30, não de 10. Quando nada cabe na janela, voltamos ao teto
 * antigo (duração ≤ tempo) em vez de não recomendar nada — é o que a etapa 2
 * da aba 08 chama de "oferecer duração menor".
 */
export function filtrarPorTempoENivel(
  seguros: Candidatura[],
  contexto: ContextoUsuario,
  config: EngineConfig,
): ResultadoDosFiltros {
  const janela = janelaDeTempo(contexto.checkin.tempo, config);
  const naJanela = aplicar(seguros, contexto, (conteudo) => {
    if (conteudo.duracaoMin > janela.maximo) {
      return `Dura ${conteudo.duracaoMin} min e hoje a busca é por algo perto de ${contexto.checkin.tempo} min`;
    }
    if (conteudo.duracaoMin < janela.minimo) {
      return `Dura só ${conteudo.duracaoMin} min para um tempo de ${contexto.checkin.tempo} min`;
    }
    return null;
  });

  if (naJanela.candidatos.length > 0) return naJanela;

  // Nada do tamanho pedido: melhor uma prática mais curta do que nenhuma.
  const porTeto = aplicar(seguros, contexto, (conteudo) =>
    conteudo.duracaoMin > contexto.checkin.tempo
      ? `Dura ${conteudo.duracaoMin} min e hoje só há ${contexto.checkin.tempo} min`
      : null,
  );

  return {
    ...porTeto,
    ajusteDeTempo:
      porTeto.candidatos.length > 0
        ? `Não há prática de cerca de ${contexto.checkin.tempo} minutos para hoje; a sugestão é mais curta.`
        : undefined,
  };
}

function aplicar(
  seguros: Candidatura[],
  contexto: ContextoUsuario,
  motivoDoTempo: (conteudo: Conteudo) => string | null,
): ResultadoDosFiltros {
  const candidatos: Candidatura[] = [];
  const exclusoes: Exclusao[] = [];

  for (const item of seguros) {
    const { conteudo } = item;

    const motivo = motivoDoTempo(conteudo);
    if (motivo) {
      exclusoes.push({ conteudoId: conteudo.id, regra: 'MOT-03', motivo });
      continue;
    }

    // MOT-04: nível técnico por área de experiência.
    const teto = tetoTecnico(contexto, conteudo);
    if (conteudo.nivelTecnico > teto) {
      exclusoes.push({
        conteudoId: conteudo.id,
        regra: 'MOT-04',
        motivo: `Nível ${conteudo.nivelTecnico} acima do que a experiência em ${conteudo.area} abre (${teto})`,
      });
      continue;
    }

    candidatos.push(item);
  }

  return { candidatos, exclusoes };
}
