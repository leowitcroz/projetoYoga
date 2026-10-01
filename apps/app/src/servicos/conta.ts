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

/**
 * O que o cadastro devolve: ou a conta espera a confirmação do e-mail
 * (AUTH-02), ou a sessão já vem junto.
 */
export type ResultadoDoCadastro =
  { precisaVerificarEmail: true; email: string } | ({ precisaVerificarEmail: false } & Sessao);

/** AUTH-01 — cria a conta levando junto tudo o que foi respondido nos passos. */
export async function criarConta(dados: DadosDoCadastro): Promise<ResultadoDoCadastro> {
  const resultado = await chamar<ResultadoDoCadastro>('/auth/registro', {
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

  if (resultado.precisaVerificarEmail) {
    // Sem sessão ainda: as respostas ficam guardadas até a conta ser
    // confirmada e a pessoa entrar pela primeira vez.
    return resultado;
  }

  await salvarSessao(resultado);
  await limparRespostas();
  return resultado;
}

/** AUTH-02 — confirma o e-mail com o token que veio no link. */
export function verificarEmail(token: string): Promise<{ verificado: true }> {
  return chamar<{ verificado: true }>('/auth/verificar-email', {
    metodo: 'POST',
    publica: true,
    corpo: { token },
  });
}

export function reenviarVerificacao(email: string): Promise<void> {
  return chamar<void>('/auth/reenviar-verificacao', {
    metodo: 'POST',
    publica: true,
    corpo: { email },
  });
}

/** AUTH-04 — pede o link de redefinição. */
export function pedirRedefinicaoDeSenha(email: string): Promise<void> {
  return chamar<void>('/auth/esqueci-senha', {
    metodo: 'POST',
    publica: true,
    corpo: { email },
  });
}

export function redefinirSenha(token: string, senha: string): Promise<{ redefinida: true }> {
  return chamar<{ redefinida: true }>('/auth/redefinir-senha', {
    metodo: 'POST',
    publica: true,
    corpo: { token, senha },
  });
}

/** AUTH-03 — login de quem já tem conta. */
export async function entrar(email: string, senha: string): Promise<Sessao> {
  const nova = await chamar<Sessao>('/auth/login', {
    metodo: 'POST',
    publica: true,
    corpo: { email, senha },
  });

  await salvarSessao(nova);
  // Entrou: as respostas do cadastro já estão na conta, podem sair do aparelho.
  await limparRespostas();
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
 * AUTH-07 — excluir a conta.
 *
 * Apaga tudo na API e limpa o aparelho. Não tem volta, e a tela precisa
 * deixar isso claro antes de chamar aqui.
 */
export async function excluirConta(): Promise<void> {
  await chamar<void>('/auth/conta', { metodo: 'DELETE' });

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
