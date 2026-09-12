import { describe, expect, it } from 'vitest';
import { temErro, validarLogin } from '@/utils/validacao';

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
