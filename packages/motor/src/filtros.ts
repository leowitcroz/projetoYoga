import type {
  Conteudo,
  ContextoUsuario,
  Exclusao,
  NivelExperiencia,
  StatusSeguranca,
} from '@life/shared';

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

export interface ResultadoDosFiltros {
  candidatos: { conteudo: Conteudo; status: StatusSeguranca }[];
  exclusoes: Exclusao[];
}

export function filtrarPorTempoENivel(
  seguros: { conteudo: Conteudo; status: StatusSeguranca }[],
  contexto: ContextoUsuario,
): ResultadoDosFiltros {
  const candidatos: { conteudo: Conteudo; status: StatusSeguranca }[] = [];
  const exclusoes: Exclusao[] = [];

  for (const item of seguros) {
    const { conteudo } = item;

    // MOT-03: nada de oferecer 32 minutos para quem tem 30.
    if (conteudo.duracaoMin > contexto.checkin.tempo) {
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
