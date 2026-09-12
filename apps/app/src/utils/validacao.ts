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
