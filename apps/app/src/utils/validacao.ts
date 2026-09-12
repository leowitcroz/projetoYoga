/** Validação do formulário de login (LoginPage). */
export interface ErrosLogin {
  email?: string;
  senha?: string;
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarLogin(email: string, senha: string): ErrosLogin {
  const erros: ErrosLogin = {};

  const emailLimpo = email.trim();
  if (!emailLimpo) {
    erros.email = 'Informe seu e-mail.';
  } else if (!FORMATO_EMAIL.test(emailLimpo)) {
    erros.email = 'Esse e-mail não parece válido.';
  }

  if (!senha) {
    erros.senha = 'Informe sua senha.';
  }

  return erros;
}

export function temErro(erros: ErrosLogin): boolean {
  return Object.keys(erros).length > 0;
}

/** Validação do formulário de criação de conta (CriarContaPage). */
export interface ErrosCadastro {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  aceite?: string;
}

export const TAMANHO_MINIMO_SENHA = 8;

/** Deixa só os dígitos do telefone. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Formata o telefone enquanto a pessoa digita: (11) 91234-5678. */
export function formatarTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validarCadastro(
  nome: string,
  email: string,
  telefone: string,
  senha: string,
  aceite: boolean,
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    erros.nome = 'Informe seu nome completo.';
  } else if (!nomeLimpo.includes(' ')) {
    erros.nome = 'Informe nome e sobrenome.';
  }

  const emailLimpo = email.trim();
  if (!emailLimpo) {
    erros.email = 'Informe seu e-mail.';
  } else if (!FORMATO_EMAIL.test(emailLimpo)) {
    erros.email = 'Esse e-mail não parece válido.';
  }

  const digitos = apenasDigitos(telefone);
  if (!digitos) {
    erros.telefone = 'Informe seu telefone.';
  } else if (digitos.length < 10 || digitos.length > 11) {
    erros.telefone = 'O telefone precisa ter DDD e 8 ou 9 dígitos.';
  }

  if (!senha) {
    erros.senha = 'Crie uma senha.';
  } else if (senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `A senha precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }

  if (!aceite) {
    erros.aceite = 'É preciso aceitar a política de privacidade para criar a conta.';
  }

  return erros;
}
