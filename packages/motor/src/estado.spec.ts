import { describe, expect, it } from 'vitest';
import { CONFIG_V1 } from './configuracao.js';
import { CHECKIN_NEUTRO } from './contexto-de-teste.js';
import { estadoFuncional, perfilDoDia, periodoDoDia, regrasAcionadas } from './estado.js';
import { filtrarPorTempoENivel } from './filtros.js';
import { CATALOGO_DE_TESTE } from './catalogo-de-teste.js';
import { contextoDeTeste } from './contexto-de-teste.js';

const MANHA = new Date(2026, 8, 28, 8, 0);
const NOITE = new Date(2026, 8, 28, 21, 0);

describe('Bloco 2 — estado do dia', () => {
  it('periodoDoDia separa manhã, tarde e noite', () => {
    expect(periodoDoDia(MANHA)).toBe('manha');
    expect(periodoDoDia(new Date(2026, 8, 28, 15, 0))).toBe('tarde');
    expect(periodoDoDia(NOITE)).toBe('noite');
  });

  it('EST-001: sono ruim reduz intensidade e favorece descanso', () => {
    const { perfil, regras } = perfilDoDia({ ...CHECKIN_NEUTRO, sono: 'ruim' }, 'tarde', CONFIG_V1);

    expect(regras).toContain('EST-001');
    expect(perfil.intensidade).toBeLessThan(0);
    expect(perfil.yogaNidra).toBeGreaterThan(0);
    expect(perfil.relaxamento).toBeGreaterThan(0);
  });

  it('EST-005: energia alta libera intensidade e ativação', () => {
    const { perfil, regras } = perfilDoDia(
      { ...CHECKIN_NEUTRO, energia: 'alta' },
      'tarde',
      CONFIG_V1,
    );

    expect(regras).toContain('EST-005');
    expect(perfil.intensidade).toBeGreaterThan(0);
    expect(perfil.ativacao).toBeGreaterThan(0);
  });

  it('EST-006: estresse alto pede respiração e relaxamento', () => {
    const { perfil } = perfilDoDia({ ...CHECKIN_NEUTRO, estresse: 'alto' }, 'tarde', CONFIG_V1);

    expect(perfil.respiracaoCalma).toBeGreaterThan(0);
    expect(perfil.relaxamento).toBeGreaterThan(0);
    expect(perfil.ativacao).toBeLessThan(0);
  });

  it('EST-008: corpo cansado derruba a intensidade', () => {
    const { perfil, regras } = perfilDoDia(
      { ...CHECKIN_NEUTRO, corpo: 'cansado' },
      'tarde',
      CONFIG_V1,
    );

    expect(regras).toContain('EST-008');
    expect(perfil.intensidade).toBeLessThanOrEqual(-4);
  });

  it('EST-009: digestão pesada reduz intensidade', () => {
    const { regras } = perfilDoDia({ ...CHECKIN_NEUTRO, digestao: 'pesada' }, 'tarde', CONFIG_V1);
    expect(regras).toContain('EST-009');
  });

  it('EST-010 e EST-011: a hora do dia entra como ponderação', () => {
    expect(regrasAcionadas(CHECKIN_NEUTRO, 'noite')).toContain('EST-010');
    expect(regrasAcionadas(CHECKIN_NEUTRO, 'manha')).toContain('EST-011');

    const noite = perfilDoDia(CHECKIN_NEUTRO, 'noite', CONFIG_V1).perfil;
    const manha = perfilDoDia(CHECKIN_NEUTRO, 'manha', CONFIG_V1).perfil;
    expect(noite.yogaNidra).toBeGreaterThan(manha.yogaNidra);
    expect(manha.ativacao).toBeGreaterThan(noite.ativacao);
  });

  it('EST-012: humor abatido pede mais calma (regra nova, fora da Matriz 1.1)', () => {
    const { regras } = perfilDoDia({ ...CHECKIN_NEUTRO, humor: 'abatido' }, 'tarde', CONFIG_V1);
    expect(regras).toContain('EST-012');
  });
});

describe('MOT-05 — estado funcional', () => {
  function estadoDe(checkin: Partial<typeof CHECKIN_NEUTRO>, periodo: 'manha' | 'tarde' | 'noite') {
    const completo = { ...CHECKIN_NEUTRO, ...checkin };
    const { perfil } = perfilDoDia(completo, periodo, CONFIG_V1);
    return estadoFuncional(completo, perfil, periodo);
  }

  it('corpo cansado e sono ruim viram recuperação', () => {
    expect(estadoDe({ corpo: 'cansado', sono: 'ruim', energia: 'baixa' }, 'tarde')).toBe(
      'recuperacao',
    );
  });

  it('estresse alto vira tensão', () => {
    expect(estadoDe({ estresse: 'alto' }, 'tarde')).toBe('tensao');
  });

  it('energia alta pela manhã vira ativação', () => {
    expect(estadoDe({ energia: 'alta', sono: 'bom' }, 'manha')).toBe('ativacao');
  });

  it('dia neutro vira disponibilidade', () => {
    expect(estadoDe({}, 'tarde')).toBe('disponibilidade');
  });

  it('à noite, sem ativação, vira desaceleração', () => {
    expect(estadoDe({}, 'noite')).toBe('desaceleracao');
  });
});

describe('Etapas 2 e 3 — tempo e nível', () => {
  it('MOT-03: não oferece prática mais longa que o tempo disponível', () => {
    const contexto = contextoDeTeste({
      checkin: { tempo: 20 },
      perfil: { experiencia: { asanas: 'experiente', nidra: 'experiente' } },
    });
    const seguros = CATALOGO_DE_TESTE.filter((c) => c.aprovado).map((conteudo) => ({
      conteudo,
      statusSeguranca: 'livre' as const,
      status: 'livre' as const,
    }));

    const { candidatos, exclusoes } = filtrarPorTempoENivel(seguros, contexto);

    expect(candidatos.every((item) => item.conteudo.duracaoMin <= 20)).toBe(true);
    expect(exclusoes.some((item) => item.regra === 'MOT-03')).toBe(true);
  });

  it('MOT-04: nível técnico é limitado pela experiência da área', () => {
    const iniciante = contextoDeTeste({ perfil: { experiencia: { asanas: 'nunca' } } });
    const seguros = CATALOGO_DE_TESTE.filter((c) => c.area === 'asanas' && c.aprovado).map(
      (conteudo) => ({ conteudo, status: 'livre' as const }),
    );

    const { candidatos } = filtrarPorTempoENivel(seguros, iniciante);
    expect(candidatos.every((item) => item.conteudo.nivelTecnico <= 1)).toBe(true);
  });

  it('MOT-04: quem não respondeu sobre a área começa pelo nível 1', () => {
    const contexto = contextoDeTeste({ perfil: { experiencia: {} } });
    const seguros = CATALOGO_DE_TESTE.filter((c) => c.aprovado).map((conteudo) => ({
      conteudo,
      status: 'livre' as const,
    }));

    const { candidatos } = filtrarPorTempoENivel(seguros, contexto);
    expect(candidatos.every((item) => item.conteudo.nivelTecnico === 1)).toBe(true);
  });
});
