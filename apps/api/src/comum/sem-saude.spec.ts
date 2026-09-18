import { describe, expect, it } from 'vitest';
import { limparParaLog } from './sem-saude.js';

describe('limparParaLog (PRIV-02)', () => {
  it('esconde as condições de saúde', () => {
    const limpo = limparParaLog({ userId: 'u1', condicoes: ['gestacao', 'hernia'] });

    expect(limpo).toEqual({ userId: 'u1', condicoes: '[escondido]' });
    expect(JSON.stringify(limpo)).not.toContain('hernia');
  });

  it('esconde senha e tokens', () => {
    const limpo = limparParaLog({ email: 'a@b.com', senha: 'segredo123', refreshToken: 'abc' });

    expect(limpo).toEqual({
      email: 'a@b.com',
      senha: '[escondido]',
      refreshToken: '[escondido]',
    });
  });

  it('alcança objetos aninhados e listas', () => {
    const limpo = limparParaLog({
      usuarios: [{ nome: 'Júlia', saude: { condicoes: ['dor lombar'] } }],
    });

    expect(JSON.stringify(limpo)).not.toContain('dor lombar');
  });

  it('deixa passar o que não é sensível', () => {
    expect(limparParaLog({ objetivoPrincipal: 'sono', passoConcluido: 5 })).toEqual({
      objetivoPrincipal: 'sono',
      passoConcluido: 5,
    });
  });
});
