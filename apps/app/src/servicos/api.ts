import { carregarSessaoSalva, limparSessao, salvarSessao, sessao, type Sessao } from './sessao.js';

/**
 * Endereço da API. Em desenvolvimento usamos o mesmo endereço pelo qual o
 * app foi aberto, só trocando a porta: assim funciona tanto no computador
 * (localhost) quanto no celular (IP da rede), sem configurar nada.
 */
const urlBase =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  `${window.location.protocol}//${window.location.hostname}:3100`;

/** Erro com a mensagem que a API mandou, pronta para mostrar na tela. */
export class ErroDaApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroDaApi';
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  /** Rotas públicas (login, registro) não mandam token nem tentam renovar. */
  publica?: boolean;
}

export async function chamar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const resposta = await enviar(caminho, opcoes);

  // Access token vencido: renova com o refresh e tenta de novo, uma vez só.
  if (resposta.status === 401 && !opcoes.publica) {
    const renovou = await renovarSessao();
    if (renovou) return lerResposta<T>(await enviar(caminho, opcoes));

    await limparSessao();
  }

  return lerResposta<T>(resposta);
}

async function enviar(caminho: string, opcoes: Opcoes): Promise<Response> {
  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = sessao.value?.accessToken;
  if (token && !opcoes.publica) cabecalhos.Authorization = `Bearer ${token}`;

  return fetch(urlBase + caminho, {
    method: opcoes.metodo ?? 'GET',
    headers: cabecalhos,
    body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
  });
}

async function lerResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) return undefined as T;

  const texto = await resposta.text();
  const dados: unknown = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ErroDaApi(resposta.status, mensagemDoErro(dados));
  }
  return dados as T;
}

/** A API manda `message` como texto ou como lista de erros de validação. */
function mensagemDoErro(dados: unknown): string {
  const mensagem = (dados as { message?: string | string[] } | null)?.message;
  if (Array.isArray(mensagem)) return mensagem[0] ?? 'Não deu certo. Tente de novo';
  return mensagem ?? 'Não deu certo. Tente de novo';
}

async function renovarSessao(): Promise<boolean> {
  const atual = await carregarSessaoSalva();
  if (!atual) return false;

  try {
    const nova = await chamar<Sessao>('/auth/refresh', {
      metodo: 'POST',
      corpo: { refreshToken: atual.refreshToken },
      publica: true,
    });
    await salvarSessao(nova);
    return true;
  } catch {
    return false;
  }
}
