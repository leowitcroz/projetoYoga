import { ref } from 'vue';

/**
 * Conversa com a API, do lado do painel.
 *
 * É mais simples que a do app: aqui não há Capacitor nem aparelho, e a sessão
 * vive no navegador de quem cataloga.
 */
const urlBase =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  `${window.location.protocol}//${window.location.hostname}:3100`;

const CHAVE = 'life.painel.sessao';

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  usuario: { id: string; nome: string; email: string; papel?: string };
}

export const sessao = ref<Sessao | null>(lerSessaoSalva());

function lerSessaoSalva(): Sessao | null {
  try {
    const salva = localStorage.getItem(CHAVE);
    return salva ? (JSON.parse(salva) as Sessao) : null;
  } catch {
    return null;
  }
}

export function guardarSessao(nova: Sessao): void {
  sessao.value = nova;
  localStorage.setItem(CHAVE, JSON.stringify(nova));
}

export function limparSessao(): void {
  sessao.value = null;
  localStorage.removeItem(CHAVE);
}

export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  publica?: boolean;
}

export async function chamar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessao.value && !opcoes.publica) {
    cabecalhos.Authorization = `Bearer ${sessao.value.accessToken}`;
  }

  const resposta = await fetch(urlBase + caminho, {
    method: opcoes.metodo ?? 'GET',
    headers: cabecalhos,
    body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
  });

  if (resposta.status === 401 && !opcoes.publica) {
    limparSessao();
    throw new ErroDaApi(401, 'Sua sessão expirou. Entre de novo.');
  }

  const texto = await resposta.text();
  const dados: unknown = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) throw new ErroDaApi(resposta.status, mensagemDoErro(dados));
  return dados as T;
}

function mensagemDoErro(dados: unknown): string {
  const mensagem = (dados as { message?: string | string[] } | null)?.message;
  if (Array.isArray(mensagem)) return mensagem.join('. ');
  return mensagem ?? 'Não deu certo. Tente de novo.';
}

export async function entrar(email: string, senha: string): Promise<void> {
  const nova = await chamar<Sessao>('/auth/login', {
    metodo: 'POST',
    publica: true,
    corpo: { email, senha },
  });
  guardarSessao(nova);
}
