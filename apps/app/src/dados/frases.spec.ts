import { describe, expect, it } from 'vitest';
import { acolhimentoDoDia, acolhimentos, ditadoDoDia, ditados, saudacaoDaHora } from './frases.js';

describe('saudacaoDaHora', () => {
  it('muda conforme o relógio', () => {
    expect(saudacaoDaHora(new Date(2026, 8, 18, 5, 0))).toBe('Bom dia');
    expect(saudacaoDaHora(new Date(2026, 8, 18, 11, 59))).toBe('Bom dia');
    expect(saudacaoDaHora(new Date(2026, 8, 18, 12, 0))).toBe('Boa tarde');
    expect(saudacaoDaHora(new Date(2026, 8, 18, 17, 59))).toBe('Boa tarde');
    expect(saudacaoDaHora(new Date(2026, 8, 18, 18, 0))).toBe('Boa noite');
    expect(saudacaoDaHora(new Date(2026, 8, 18, 4, 59))).toBe('Boa noite');
  });
});

describe('frase do dia', () => {
  it('não muda durante o mesmo dia', () => {
    const manha = new Date(2026, 8, 18, 7, 30);
    const noite = new Date(2026, 8, 18, 22, 10);

    expect(acolhimentoDoDia(manha)).toBe(acolhimentoDoDia(noite));
    expect(ditadoDoDia(manha)).toEqual(ditadoDoDia(noite));
  });

  it('troca de um dia para o outro', () => {
    const hoje = new Date(2026, 8, 18, 9, 0);
    const amanha = new Date(2026, 8, 19, 9, 0);

    expect(acolhimentoDoDia(hoje)).not.toBe(acolhimentoDoDia(amanha));
    expect(ditadoDoDia(hoje).texto).not.toBe(ditadoDoDia(amanha).texto);
  });

  it('passa por todos os ditados antes de repetir', () => {
    const vistos = new Set<string>();
    for (let dia = 0; dia < ditados.length; dia += 1) {
      vistos.add(ditadoDoDia(new Date(2026, 8, 18 + dia, 9, 0)).texto);
    }
    expect(vistos.size).toBe(ditados.length);
  });

  it('toda frase tem texto e fonte', () => {
    expect(acolhimentos.every((frase) => frase.trim().length > 0)).toBe(true);
    expect(ditados.every((item) => item.texto.trim() && item.fonte.trim())).toBe(true);
  });
});
