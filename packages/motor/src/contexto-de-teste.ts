import type { Checkin, ContextoUsuario, PerfilUsuario, SaudeUsuario } from '@life/shared';

/** Atalhos para montar contextos nos testes sem repetir o objeto inteiro. */

export const CHECKIN_NEUTRO: Checkin = {
  sono: 'razoavel',
  energia: 'media',
  corpo: 'normal',
  dor: 'nenhuma',
  estresse: 'tranquilo',
  digestao: 'normal',
  humor: 'equilibrado',
  tempo: 30,
};

export function contextoDeTeste(
  ajustes: {
    perfil?: Partial<PerfilUsuario>;
    saude?: Partial<SaudeUsuario>;
    checkin?: Partial<Checkin>;
    historico?: ContextoUsuario['historico'];
    diasSeguidosComDor?: number;
  } = {},
): ContextoUsuario {
  return {
    perfil: {
      objetivosSecundarios: [],
      experiencia: {},
      modalidadesPreferidas: [],
      ...ajustes.perfil,
    },
    saude: {
      consentida: true,
      condicoes: [],
      ...ajustes.saude,
    },
    checkin: { ...CHECKIN_NEUTRO, ...ajustes.checkin },
    historico: ajustes.historico ?? [],
    diasSeguidosComDor: ajustes.diasSeguidosComDor,
  };
}
