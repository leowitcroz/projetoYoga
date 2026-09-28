import { describe, expect, it } from 'vitest';
import type { Conteudo } from '@life/shared';
import { CATALOGO_DE_TESTE } from './catalogo-de-teste.js';
import { CONFIG_V1 } from './configuracao.js';
import { contextoDeTeste } from './contexto-de-teste.js';
import { avaliarSeguranca, avisoDePersistencia, filtrarPorSeguranca } from './seguranca.js';

function acharConteudo(id: string): Conteudo {
  const conteudo = CATALOGO_DE_TESTE.find((item) => item.id === id);
  if (!conteudo) throw new Error(`conteúdo ${id} não existe no catálogo de teste`);
  return conteudo;
}

function idsSeguros(contexto: Parameters<typeof filtrarPorSeguranca>[1]): string[] {
  return filtrarPorSeguranca(CATALOGO_DE_TESTE, contexto, CONFIG_V1).seguros.map(
    (item) => item.conteudo.id,
  );
}

describe('Bloco 1 — segurança', () => {
  it('SEG-001: dor cervical hoje bloqueia carga cervical elevada', () => {
    const contexto = contextoDeTeste({ checkin: { dor: 'leve', regiaoDaDor: 'cervical' } });

    // PRAT-025 tem cargaCervical 3.
    const avaliacao = avaliarSeguranca(acharConteudo('PRAT-025'), contexto, CONFIG_V1);
    expect(avaliacao.status).toBe('bloquear');
    expect(avaliacao.regras).toContain('SEG-001');
    expect(idsSeguros(contexto)).not.toContain('PRAT-025');
  });

  it('SEG-002: carga cervical média vira versão adaptada quando ela existe', () => {
    const contexto = contextoDeTeste({ checkin: { dor: 'leve', regiaoDaDor: 'cervical' } });

    // PRAT-012 tem cargaCervical 2 e versão adaptada aprovada.
    const avaliacao = avaliarSeguranca(acharConteudo('PRAT-012'), contexto, CONFIG_V1);
    expect(avaliacao.status).toBe('adaptar');
    expect(avaliacao.regras).toContain('SEG-002');
    expect(idsSeguros(contexto)).toContain('PRAT-012');
  });

  it('SEG-002: sem versão adaptada, "adaptar" vira bloqueio', () => {
    const semAdaptacao: Conteudo = { ...acharConteudo('PRAT-012'), temVersaoAdaptada: false };
    const contexto = contextoDeTeste({ checkin: { dor: 'leve', regiaoDaDor: 'cervical' } });

    expect(avaliarSeguranca(semAdaptacao, contexto, CONFIG_V1).status).toBe('bloquear');
  });

  it('SEG-003: condição ocular tira as invertidas', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['glaucoma'] } });
    const seguros = idsSeguros(contexto);

    expect(seguros).not.toContain('PRAT-023');
    expect(seguros).not.toContain('PRAT-025');
  });

  it('SEG-005: tontura tira o conteúdo com risco de queda', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['tontura'] } });

    expect(idsSeguros(contexto)).not.toContain('PRAT-026');
  });

  it('SEG-006: pressão elevada tira as retenções respiratórias', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['hipertensao'] } });

    expect(idsSeguros(contexto)).not.toContain('PRAT-004');
  });

  it('SEG-007: demanda cardiovascular alta fica em atenção, não bloqueada', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['hipertensao'] } });
    const avaliacao = avaliarSeguranca(acharConteudo('PRAT-021'), contexto, CONFIG_V1);

    expect(avaliacao.status).toBe('atencao');
    expect(avaliacao.regras).toContain('SEG-007');
    expect(idsSeguros(contexto)).toContain('PRAT-021');
  });

  it('SEG-008: na gestação só entra conteúdo revisado para gestação', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['gestacao'] } });
    const seguros = idsSeguros(contexto);

    expect(seguros).toEqual(['PRAT-027']);
  });

  it('SEG-009: dor no joelho tira carga elevada no joelho', () => {
    const contexto = contextoDeTeste({ checkin: { dor: 'leve', regiaoDaDor: 'joelhos' } });

    expect(idsSeguros(contexto)).not.toContain('PRAT-024');
  });

  it('SEG-010: cirurgia recente aplica a regra conservadora', () => {
    const contexto = contextoDeTeste({ saude: { condicoes: ['cirurgia-recente'] } });
    const seguros = idsSeguros(contexto);

    expect(seguros).not.toContain('PRAT-021');
    expect(seguros).not.toContain('PRAT-022');
  });

  it('SEG-R05: dor de hoje aciona o bloco mesmo sem condição cadastrada', () => {
    const contexto = contextoDeTeste({
      saude: { consentida: true, condicoes: [] },
      checkin: { dor: 'forte', regiaoDaDor: 'lombar' },
    });

    expect(idsSeguros(contexto)).not.toContain('PRAT-013');
  });

  it('SEG-R03: dor repetida por vários dias gera aviso de persistência', () => {
    expect(
      avisoDePersistencia(contextoDeTeste({ diasSeguidosComDor: 1 }), CONFIG_V1),
    ).toBeUndefined();

    const aviso = avisoDePersistencia(contextoDeTeste({ diasSeguidosComDor: 4 }), CONFIG_V1);
    expect(aviso).toContain('4 dias');
  });

  it('MOT-02: conteúdo não aprovado nunca é candidato', () => {
    const contexto = contextoDeTeste();
    const resultado = filtrarPorSeguranca(CATALOGO_DE_TESTE, contexto, CONFIG_V1);

    expect(resultado.seguros.map((item) => item.conteudo.id)).not.toContain('PRAT-090');
    expect(resultado.exclusoes).toContainEqual({
      conteudoId: 'PRAT-090',
      regra: 'MOT-02',
      motivo: 'Conteúdo ainda não aprovado',
    });
  });

  it('MOT-12: sem consentimento de saúde entra o modo conservador', () => {
    const contexto = contextoDeTeste({ saude: { consentida: false, condicoes: [] } });
    const resultado = filtrarPorSeguranca(CATALOGO_DE_TESTE, contexto, CONFIG_V1);
    const seguros = resultado.seguros.map((item) => item.conteudo.id);

    expect(resultado.modoConservador).toBe(true);
    expect(seguros).not.toContain('PRAT-023'); // invertida
    expect(seguros).not.toContain('PRAT-004'); // retenção
    expect(seguros).not.toContain('PRAT-022'); // demanda física 5
    expect(seguros).toContain('PRAT-005'); // suave continua
  });
});
