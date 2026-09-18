import { ref } from 'vue';
import { apagar, guardar, ler } from './armazenamento.js';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  expiraEm: number;
  usuario: Usuario;
}

const CHAVE = 'life.sessao';

/** Sessão atual. `null` = ninguém logado. */
export const sessao = ref<Sessao | null>(null);
/** Vira `true` quando já tentamos ler a sessão salva no aparelho. */
export const sessaoCarregada = ref(false);

/** Lê a sessão guardada no aparelho para que o login não seja refeito toda vez. */
export async function carregarSessaoSalva(): Promise<Sessao | null> {
  if (!sessaoCarregada.value) {
    sessao.value = await ler<Sessao>(CHAVE);
    sessaoCarregada.value = true;
  }
  return sessao.value;
}

export async function salvarSessao(nova: Sessao): Promise<void> {
  sessao.value = nova;
  sessaoCarregada.value = true;
  await guardar(CHAVE, nova);
}

export async function limparSessao(): Promise<void> {
  sessao.value = null;
  sessaoCarregada.value = true;
  await apagar(CHAVE);
}

export function estaLogado(): boolean {
  return sessao.value !== null;
}
