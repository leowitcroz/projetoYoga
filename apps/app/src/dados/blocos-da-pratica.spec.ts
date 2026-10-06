import { describe, expect, it } from 'vitest';
import { montarEstrutura, porqueDaPratica } from './blocos-da-pratica.js';

describe('estrutura da prática (PRA-07)', () => {
  it('mantém a ordem da ficha e traduz cada bloco', () => {
    const blocos = montarEstrutura([
      { tipo: 'preparacao', minutos: 4 },
      { tipo: 'asanas', minutos: 14 },
      { tipo: 'relaxamento', minutos: 5 },
    ]);

    expect(blocos.map((bloco) => bloco.nome)).toEqual(['Preparação', 'Āsanas', 'Relaxamento']);
    expect(blocos.map((bloco) => bloco.minutos)).toEqual([4, 14, 5]);
  });

  it('descarta bloco de tipo desconhecido em vez de mostrar sem nome', () => {
    const blocos = montarEstrutura([
      { tipo: 'asanas', minutos: 10 },
      { tipo: 'cafezinho', minutos: 5 },
    ]);

    expect(blocos).toHaveLength(1);
    expect(blocos[0]?.nome).toBe('Āsanas');
  });

  it('prática sem estrutura não vira lista vazia enganosa', () => {
    expect(montarEstrutura(undefined)).toEqual([]);
    expect(montarEstrutura(null)).toEqual([]);
    expect(montarEstrutura([])).toEqual([]);
  });
});

describe('por que esta prática (MOT-09)', () => {
  const recomendada = { id: 'PRAT-010', explicacao: 'Hoje parece um dia de recuperar.' };

  it('explica quando a aula aberta é a recomendada do dia', () => {
    expect(porqueDaPratica('PRAT-010', recomendada)).toBe('Hoje parece um dia de recuperar.');
  });

  it('cala quando a pessoa escolheu outra prática', () => {
    expect(porqueDaPratica('PRAT-022', recomendada)).toBeUndefined();
  });

  it('cala quando não houve recomendação nenhuma', () => {
    expect(porqueDaPratica('PRAT-010', undefined)).toBeUndefined();
  });
});
