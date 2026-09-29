import { describe, expect, it } from 'vitest';
import type { Conteudo } from '@life/shared';
import { CATALOGO_DE_TESTE } from './catalogo-de-teste.js';
import { CONFIG_V1 } from './configuracao.js';
import { contextoDeTeste } from './contexto-de-teste.js';
import { aplicarModificadores, escolherDescoberta } from './modificadores.js';

const HOJE = new Date(2026, 8, 28, 10, 0);

function conteudo(id: string): Conteudo {
  const achado = CATALOGO_DE_TESTE.find((item) => item.id === id);
  if (!achado) throw new Error(`conteúdo ${id} não existe`);
  return achado;
}

describe('MOT-07 — modificadores', () => {
  it('PER-008: a próxima aula da trilha ganha o bônus de continuidade', () => {
    const contexto = contextoDeTeste({
      historico: [
        { conteudoId: 'PRAT-010', dia: '2026-09-20', trilhaId: 'TRILHA-MOB-01', ordemTrilha: 1 },
      ],
    });

    const aplicados = aplicarModificadores(
      conteudo('PRAT-011'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );
    expect(aplicados).toContainEqual({
      regra: 'PER-008',
      pontos: 10,
      motivo: 'É a próxima aula da sua trilha',
    });
  });

  it('PER-008: pular a ordem da trilha não ganha bônus', () => {
    const contexto = contextoDeTeste({
      historico: [
        { conteudoId: 'PRAT-010', dia: '2026-09-20', trilhaId: 'TRILHA-MOB-01', ordemTrilha: 1 },
      ],
    });
    // A aula 1 já foi feita: ela não é mais a próxima.
    const aplicados = aplicarModificadores(
      conteudo('PRAT-010'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );
    expect(aplicados.map((item) => item.regra)).not.toContain('PER-008');
  });

  it('quem nunca começou a trilha recebe o bônus na aula 1', () => {
    const aplicados = aplicarModificadores(
      conteudo('PRAT-010'),
      'livre',
      contextoDeTeste(),
      CONFIG_V1,
      HOJE,
    );
    expect(aplicados.map((item) => item.regra)).toContain('PER-008');
  });

  it('praticado ontem: −15', () => {
    const contexto = contextoDeTeste({
      historico: [{ conteudoId: 'PRAT-005', dia: '2026-09-27' }],
    });
    const aplicados = aplicarModificadores(
      conteudo('PRAT-005'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );

    expect(aplicados.find((item) => item.regra === 'MOD-repeticao-ontem')?.pontos).toBe(-15);
  });

  it('praticado nos últimos três dias: −8', () => {
    const contexto = contextoDeTeste({
      historico: [{ conteudoId: 'PRAT-005', dia: '2026-09-26' }],
    });
    const aplicados = aplicarModificadores(
      conteudo('PRAT-005'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );

    expect(aplicados.find((item) => item.regra === 'MOD-repeticao-3-dias')?.pontos).toBe(-8);
  });

  it('praticado há muito tempo não sofre penalidade', () => {
    const contexto = contextoDeTeste({
      historico: [{ conteudoId: 'PRAT-005', dia: '2026-08-01' }],
    });
    const aplicados = aplicarModificadores(
      conteudo('PRAT-005'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );

    expect(aplicados.map((item) => item.regra)).not.toContain('MOD-repeticao-ontem');
    expect(aplicados.map((item) => item.regra)).not.toContain('MOD-repeticao-3-dias');
  });

  it('SEG-007: status de atenção reduz a prioridade sem bloquear', () => {
    const aplicados = aplicarModificadores(
      conteudo('PRAT-021'),
      'atencao',
      contextoDeTeste(),
      CONFIG_V1,
      HOJE,
    );
    expect(aplicados.find((item) => item.regra === 'SEG-007')?.pontos).toBeLessThan(0);
  });

  it('SEG-002: versão adaptada perde alguns pontos', () => {
    const aplicados = aplicarModificadores(
      conteudo('PRAT-012'),
      'adaptar',
      contextoDeTeste(),
      CONFIG_V1,
      HOJE,
    );
    expect(aplicados.find((item) => item.regra === 'SEG-002')?.pontos).toBe(-5);
  });
});

describe('MOT-03 — aproveitamento do tempo', () => {
  it('a prática do tamanho pedido não perde nada', () => {
    const contexto = contextoDeTeste({ checkin: { tempo: 20 } });
    // PRAT-001 dura 20 minutos.
    const aplicados = aplicarModificadores(
      conteudo('PRAT-001'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );

    expect(aplicados.map((item) => item.regra)).not.toContain('MOT-03');
  });

  it('a prática muito mais curta que o tempo perde pontos', () => {
    const contexto = contextoDeTeste({ checkin: { tempo: 60 } });
    // PRAT-003 dura 10 minutos: usa um sexto do tempo reservado.
    const aplicados = aplicarModificadores(
      conteudo('PRAT-003'),
      'livre',
      contexto,
      CONFIG_V1,
      HOJE,
    );
    const tempo = aplicados.find((item) => item.regra === 'MOT-03');

    expect(tempo?.pontos).toBeLessThan(0);
    expect(tempo?.motivo).toContain('60');
  });

  it('quanto mais curta, maior o desconto', () => {
    const contexto = contextoDeTeste({ checkin: { tempo: 60 } });
    const dez = aplicarModificadores(conteudo('PRAT-003'), 'livre', contexto, CONFIG_V1, HOJE);
    const trinta = aplicarModificadores(conteudo('PRAT-006'), 'livre', contexto, CONFIG_V1, HOJE);

    const pontosDez = dez.find((item) => item.regra === 'MOT-03')?.pontos ?? 0;
    const pontosTrinta = trinta.find((item) => item.regra === 'MOT-03')?.pontos ?? 0;

    expect(pontosDez).toBeLessThan(pontosTrinta);
  });

  it('o desconto nunca chega ao peso do estado do dia', () => {
    const contexto = contextoDeTeste({ checkin: { tempo: 60 } });

    for (const item of CATALOGO_DE_TESTE) {
      const aplicados = aplicarModificadores(item, 'livre', contexto, CONFIG_V1, HOJE);
      const pontos = aplicados.find((m) => m.regra === 'MOT-03')?.pontos ?? 0;
      // Senão o relógio venceria a adequação, que é o contrário do que queremos.
      expect(Math.abs(pontos)).toBeLessThan(CONFIG_V1.pesos.estado);
      expect(Math.abs(pontos)).toBeLessThanOrEqual(CONFIG_V1.tempo.penalidadeMaxima);
    }
  });
});

describe('MOT-07 — descoberta', () => {
  const ordenados = CATALOGO_DE_TESTE.map((conteudo) => ({ conteudo }));

  it('só sugere conteúdo que a pessoa ainda não praticou', () => {
    const contexto = contextoDeTeste({
      historico: CATALOGO_DE_TESTE.map((item) => ({ conteudoId: item.id, dia: '2026-09-01' })),
    });

    expect(escolherDescoberta(ordenados, contexto, CONFIG_V1, 5)).toBeUndefined();
  });

  it('acontece só em parte dos dias, conforme a fatia configurada', () => {
    const contexto = contextoDeTeste();
    const dias = 100;
    let comDescoberta = 0;

    for (let semente = 0; semente < dias; semente += 1) {
      if (escolherDescoberta(ordenados, contexto, CONFIG_V1, semente)) comDescoberta += 1;
    }

    // 15% configurados; margem para o arredondamento da semente.
    expect(comDescoberta).toBeGreaterThan(5);
    expect(comDescoberta).toBeLessThan(25);
  });

  it('a mesma semente devolve sempre a mesma sugestão', () => {
    const contexto = contextoDeTeste();
    const primeira = escolherDescoberta(ordenados, contexto, CONFIG_V1, 3);
    const segunda = escolherDescoberta(ordenados, contexto, CONFIG_V1, 3);

    expect(primeira?.id).toBe(segunda?.id);
  });
});
