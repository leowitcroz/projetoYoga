import { chamar } from './api.js';
import { esquecerCheckin } from './checkin-do-dia.js';
import { limparRespostas, respostas } from './respostas.js';
import { carregarSessaoSalva, limparSessao, salvarSessao, sessao, type Sessao } from './sessao.js';

export interface DadosDoCadastro {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  aceitePrivacidade: boolean;
}

/** AUTH-01 — cria a conta levando junto tudo o que foi respondido nos passos. */
export async function criarConta(dados: DadosDoCadastro): Promise<Sessao> {
  const nova = await chamar<Sessao>('/auth/registro', {
    metodo: 'POST',
    publica: true,
    corpo: {
      ...dados,
      // Quem respondeu o passo 3 aceitou compartilhar os dados de saúde ali (ONB-03).
      aceiteSaude: respostas.saude !== null,
      onboarding: respostas.onboarding,
      saude: respostas.saude ?? undefined,
    },
  });

  await salvarSessao(nova);
  await limparRespostas();
  return nova;
}

/** AUTH-03 — login de quem já tem conta. */
export async function entrar(email: string, senha: string): Promise<Sessao> {
  const nova = await chamar<Sessao>('/auth/login', {
    metodo: 'POST',
    publica: true,
    corpo: { email, senha },
  });

  await salvarSessao(nova);
  return nova;
}

export async function sair(): Promise<void> {
  const atual = sessao.value;
  if (atual) {
    try {
      await chamar<void>('/auth/logout', {
        metodo: 'POST',
        publica: true,
        corpo: { refreshToken: atual.refreshToken },
      });
    } catch {
      // Se a API não responder, a sessão sai do aparelho do mesmo jeito.
    }
  }
  // O check-in e as respostas do cadastro saem do aparelho junto com a conta.
  await esquecerCheckin();
  await limparRespostas();
  await limparSessao();
}

/**
 * Confere com a API se a sessão salva ainda vale. Usado ao abrir o app:
 * se valer, a pessoa entra direto, sem refazer o login.
 */
export async function sessaoAindaVale(): Promise<boolean> {
  const salva = await carregarSessaoSalva();
  if (!salva) return false;

  try {
    await chamar<unknown>('/auth/eu');
    return true;
  } catch {
    await limparSessao();
    return false;
  }
}
