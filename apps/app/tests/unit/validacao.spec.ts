import { describe, expect, it } from 'vitest';
import { formatarTelefone, temErro, validarCadastro, validarLogin } from '@/utils/validacao';

describe('validarLogin', () => {
  it('cobra o e-mail quando está vazio', () => {
    expect(validarLogin('', 'senha123').email).toBe('Informe seu e-mail.');
  });

  it('avisa quando o e-mail tem formato inválido', () => {
    expect(validarLogin('leo@', 'senha123').email).toBe('Esse e-mail não parece válido.');
  });

  it('cobra a senha quando está vazia', () => {
    expect(validarLogin('leo@life.com.br', '').senha).toBe('Informe sua senha.');
  });

  it('não reclama quando e-mail e senha estão preenchidos', () => {
    const erros = validarLogin('  leo@life.com.br  ', 'senha123');
    expect(temErro(erros)).toBe(false);
  });
});

describe('formatarTelefone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678');
  });

  it('formata fixo com 10 dígitos', () => {
    expect(formatarTelefone('1132145678')).toBe('(11) 3214-5678');
  });

  it('ignora o que não for número', () => {
    expect(formatarTelefone('abc11def9123')).toBe('(11) 9123');
  });
});

describe('validarCadastro', () => {
  const ok = ['Leonardo Silva', 'leo@life.com.br', '(11) 91234-5678', 'senha1234', true] as const;

  it('aceita um cadastro completo', () => {
    expect(temErro(validarCadastro(...ok))).toBe(false);
  });

  it('cobra nome e sobrenome', () => {
    expect(validarCadastro('Leonardo', ok[1], ok[2], ok[3], ok[4]).nome).toBe(
      'Informe nome e sobrenome.',
    );
  });

  it('cobra telefone com DDD', () => {
    expect(validarCadastro(ok[0], ok[1], '(11) 9123', ok[3], ok[4]).telefone).toContain('DDD');
  });

  it('cobra senha com o tamanho mínimo', () => {
    expect(validarCadastro(ok[0], ok[1], ok[2], '1234', ok[4]).senha).toContain('8 caracteres');
  });

  it('exige o aceite da política', () => {
    expect(validarCadastro(ok[0], ok[1], ok[2], ok[3], false).aceite).toBeTruthy();
  });
});
