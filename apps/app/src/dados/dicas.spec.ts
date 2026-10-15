import { describe, expect, it } from 'vitest';
import { dicaDoDia, dicas } from './dicas.js';

describe('dica do dia (EDU-06)', () => {
  it('não muda durante o mesmo dia', () => {
    const manha = new Date(2026, 9, 15, 7, 30);
    const noite = new Date(2026, 9, 15, 22, 10);

    expect(dicaDoDia(manha)).toEqual(dicaDoDia(noite));
  });

  it('troca de um dia para o outro', () => {
    const hoje = new Date(2026, 9, 15, 9, 0);
    const amanha = new Date(2026, 9, 16, 9, 0);

    expect(dicaDoDia(hoje).texto).not.toBe(dicaDoDia(amanha).texto);
  });

  it('percorre a lista inteira antes de repetir', () => {
    const vistas = new Set<string>();
    for (let dia = 0; dia < dicas.length; dia++) {
      vistas.add(dicaDoDia(new Date(2026, 9, 1 + dia)).texto);
    }
    expect(vistas.size).toBe(dicas.length);
  });

  it('toda dica diz de onde vem', () => {
    for (const dica of dicas) {
      expect(dica.fonte).toBeTruthy();
      expect(dica.texto.length).toBeGreaterThan(20);
    }
  });

  it('nenhuma dica promete resultado (seção 9 do plano)', () => {
    // A regra é não afirmar causa. Estes verbos são os que mais escapam ao
    // escrever rápido — "reduz o estresse", "melhora o sono", "cura".
    const proibidos = /\b(reduz|melhora|cura|elimina|garante|previne|trata)\b/i;

    for (const dica of dicas) {
      expect(dica.texto, `dica promete resultado: "${dica.texto}"`).not.toMatch(proibidos);
    }
  });

  it('o que é leitura ayurvédica está identificado como tal', () => {
    for (const dica of dicas) {
      if (/ayurv|doṣa|vāta|pitta|kapha/i.test(dica.texto)) {
        expect(dica.fonte).toBe('Visão Ayurvédica');
      }
    }
  });
});
