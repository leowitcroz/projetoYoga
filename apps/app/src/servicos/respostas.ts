import { reactive } from 'vue';
import { apagar, guardar, ler } from './armazenamento.js';

/**
 * Respostas dos 5 passos de perguntas. Elas são respondidas antes de existir
 * conta, então ficam guardadas no aparelho até o cadastro (aí vão para a API).
 * Se o app fechar no meio, nada se perde (ONB-08).
 */
export interface RespostasOnboarding {
  objetivoPrincipal?: string;
  objetivosSecundarios?: string[];
  experiencia?: Record<string, string>;
  constituicao?: string;
  estadoAtual?: string;
  estilos?: string[];
  temas?: string[];
  horarioPreferido?: string;
  passoConcluido?: number;
}

export interface RespostasSaude {
  condicoes: string[];
}

const CHAVE = 'life.respostas';

export const respostas = reactive<{
  onboarding: RespostasOnboarding;
  saude: RespostasSaude | null;
}>({ onboarding: {}, saude: null });

export async function carregarRespostasSalvas(): Promise<void> {
  const salvas = await ler<{ onboarding: RespostasOnboarding; saude: RespostasSaude | null }>(
    CHAVE,
  );
  if (salvas) {
    respostas.onboarding = salvas.onboarding ?? {};
    respostas.saude = salvas.saude ?? null;
  }
}

/** Guarda o que foi respondido em um passo e marca até onde a pessoa chegou. */
export async function guardarPasso(
  passo: number,
  novas: Partial<RespostasOnboarding>,
): Promise<void> {
  Object.assign(respostas.onboarding, novas);
  respostas.onboarding.passoConcluido = Math.max(respostas.onboarding.passoConcluido ?? 0, passo);
  await guardar(CHAVE, { onboarding: respostas.onboarding, saude: respostas.saude });
}

/** Saúde fica separada das outras respostas, como no banco (PRIV-02). */
export async function guardarSaude(condicoes: string[]): Promise<void> {
  respostas.saude = { condicoes };
  respostas.onboarding.passoConcluido = Math.max(respostas.onboarding.passoConcluido ?? 0, 3);
  await guardar(CHAVE, { onboarding: respostas.onboarding, saude: respostas.saude });
}

/** Depois que a conta é criada, as respostas moram na API. */
export async function limparRespostas(): Promise<void> {
  respostas.onboarding = {};
  respostas.saude = null;
  await apagar(CHAVE);
}
