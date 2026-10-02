import { describe, expect, it } from 'vitest';
import { mensagemDeLimite } from './limite-de-tentativas.guard.js';

describe('mensagem do limite de tentativas (F2.7)', () => {
  it('fala português, sem o nome da exceção', () => {
    const mensagem = mensagemDeLimite(300);
    expect(mensagem).not.toContain('Throttler');
    expect(mensagem).not.toContain('Too Many Requests');
    expect(mensagem).toContain('Muitas tentativas');
  });

  it('arredonda a espera curta para um minuto', () => {
    expect(mensagemDeLimite(5)).toContain('em um minuto');
    expect(mensagemDeLimite(90)).toContain('em um minuto');
  });

  it('conta em minutos abaixo de uma hora', () => {
    expect(mensagemDeLimite(300)).toContain('em 5 minutos');
    expect(mensagemDeLimite(3540)).toContain('em 59 minutos');
  });

  it('conta em horas acima disso', () => {
    expect(mensagemDeLimite(3600)).toContain('daqui a uma hora');
    expect(mensagemDeLimite(7200)).toContain('daqui a 2 horas');
  });
});
