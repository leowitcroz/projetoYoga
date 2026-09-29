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
 * Vêm depois da segurança e antes do ranking. O tempo disponível é um teto
 * rígido — nada mais longo do que ele passa. O quanto a prática **aproveita**
 * esse tempo não se decide aqui: é um modificador do ranking, para que uma
 * prática mais curta e adequada ainda possa vencer uma do tamanho certo que
 * não serve para o estado de hoje.
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
}

/** A partir de que duração a prática conta como "do tamanho pedido". */
export function duracaoIdealMinima(minutos: number, config: EngineConfig): number {
  return Math.max(0, minutos - config.tempo.tolerancia);
}

/** O teto de duração de hoje. O degrau "60+" não tem teto de verdade. */
export function duracaoMaxima(minutos: number, config: EngineConfig): number {
  return minutos >= config.tempo.aberturaAPartirDe ? Number.POSITIVE_INFINITY : minutos;
}

export function filtrarPorTempoENivel(
  seguros: Candidatura[],
  contexto: ContextoUsuario,
  config: EngineConfig,
): ResultadoDosFiltros {
  const maximo = duracaoMaxima(contexto.checkin.tempo, config);
  const candidatos: Candidatura[] = [];
  const exclusoes: Exclusao[] = [];

  for (const item of seguros) {
    const { conteudo } = item;

    // MOT-03: nada de oferecer 32 minutos para quem tem 30.
    if (conteudo.duracaoMin > maximo) {
      exclusoes.push({
        conteudoId: conteudo.id,
        regra: 'MOT-03',
        motivo: `Dura ${conteudo.duracaoMin} min e hoje só há ${contexto.checkin.tempo} min`,
      });
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
