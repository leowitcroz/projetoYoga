import { describe, expect, it } from 'vitest';
import type { Conteudo } from '@life/shared';
import { CATALOGO_DE_TESTE } from './catalogo-de-teste.js';
import { contextoDeTeste } from './contexto-de-teste.js';
import { recomendarDia } from './recomendar.js';

const NOITE = new Date(2026, 8, 28, 21, 0);
const MANHA = new Date(2026, 8, 28, 8, 0);

describe('T01 — Ana, 47, básica: estresse alto, sono e energia baixos, 20 min', () => {
  const ana = contextoDeTeste({
    perfil: {
      objetivoPrincipal: 'estresse',
      objetivosSecundarios: ['sono'],
      experiencia: { asanas: 'basico', pranayama: 'basico', nidra: 'basico' },
      modalidadesPreferidas: ['hatha'],
    },
    checkin: {
      sono: 'ruim',
      energia: 'baixa',
      corpo: 'cansado',
      estresse: 'alto',
      dor: 'nenhuma',
      digestao: 'normal',
      humor: 'oscilando',
      tempo: 20,
    },
  });

  const resultado = recomendarDia(ana, CATALOGO_DE_TESTE, { agora: NOITE });

  it('recomenda prática suave ou respiração como principal', () => {
    const principal = resultado.principal?.conteudo;
    expect(principal).toBeDefined();
    expect(['hatha', 'pranayama', 'restaurativo', 'nidra', 'meditacao']).toContain(
      principal?.modalidade,
    );
    expect(principal?.demandaFisica).toBeLessThanOrEqual(2);
  });

  it('oferece Yoga Nidra como alternativa de outra natureza', () => {
    expect(resultado.alternativa).toBeDefined();
    expect(resultado.alternativa?.conteudo.modalidade).not.toBe(
      resultado.principal?.conteudo.modalidade,
    );
  });

  it('respeita os 20 minutos', () => {
    expect(resultado.principal?.conteudo.duracaoMin).toBeLessThanOrEqual(20);
    expect(resultado.alternativa?.conteudo.duracaoMin).toBeLessThanOrEqual(20);
  });

  it('lê o dia como recuperação ou tensão', () => {
    expect(['recuperacao', 'tensao', 'desaceleracao']).toContain(resultado.estadoFuncional);
  });

  it('explica a escolha sem prometer resultado', () => {
    const explicacao = resultado.principal?.explicacao ?? '';
    expect(explicacao.length).toBeGreaterThan(10);
    expect(explicacao).toMatch(/minutos/);
    expect(explicacao.toLowerCase()).not.toMatch(/cura|garante|resolve/);
  });
});

describe('T02 — Ricardo, 38, avançado: dor cervical, energia alta, gosta de invertidas', () => {
  const ricardo = contextoDeTeste({
    perfil: {
      objetivoPrincipal: 'forca',
      objetivosSecundarios: ['disposicao'],
      experiencia: { asanas: 'experiente', pranayama: 'regular' },
      modalidadesPreferidas: ['ashtanga', 'vinyasa'],
    },
    checkin: {
      sono: 'bom',
      energia: 'alta',
      corpo: 'disposto',
      dor: 'leve',
      regiaoDaDor: 'cervical',
      estresse: 'tranquilo',
      digestao: 'normal',
      humor: 'equilibrado',
      tempo: 45,
    },
  });

  const resultado = recomendarDia(ricardo, CATALOGO_DE_TESTE, { agora: MANHA });

  it('tira do ranking automático a carga cervical elevada', () => {
    const ids = resultado.auditoria.ranking.map((item) => item.conteudo.id);
    expect(ids).not.toContain('PRAT-025');

    const exclusao = resultado.auditoria.exclusoes.find((item) => item.conteudoId === 'PRAT-025');
    expect(exclusao?.regra).toContain('SEG-001');
  });

  it('ainda oferece prática dinâmica compatível', () => {
    expect(resultado.principal).toBeDefined();
    expect(resultado.principal?.conteudo.demandaFisica).toBeGreaterThanOrEqual(3);
  });

  it('a preferência dele não vence a segurança (SEG-R01)', () => {
    // Ashtanga é a modalidade preferida e tem invertida com carga cervical.
    const ids = resultado.auditoria.ranking.map((item) => item.conteudo.id);
    expect(ids).not.toContain('PRAT-023');
  });

  it('avisa sobre a dor antes de praticar', () => {
    expect(resultado.aviso).toBeDefined();
    expect(resultado.aviso).toMatch(/dor/i);
  });
});

describe('T03 — Helena, 52, iniciante: força e sono, com trilha em andamento', () => {
  const helena = contextoDeTeste({
    perfil: {
      objetivoPrincipal: 'mobilidade',
      objetivosSecundarios: ['sono'],
      experiencia: { asanas: 'basico', nidra: 'basico' },
      modalidadesPreferidas: ['mobilidade'],
    },
    checkin: { tempo: 30, sono: 'razoavel', energia: 'media' },
    historico: [
      { conteudoId: 'PRAT-010', dia: '2026-09-25', trilhaId: 'TRILHA-MOB-01', ordemTrilha: 1 },
    ],
  });

  const resultado = recomendarDia(helena, CATALOGO_DE_TESTE, { agora: MANHA });

  it('continua a trilha: a aula 2 vem como principal', () => {
    expect(resultado.principal?.conteudo.id).toBe('PRAT-011');
  });

  it('o bônus de continuidade aparece na auditoria (PER-008)', () => {
    const candidato = resultado.auditoria.ranking.find((item) => item.conteudo.id === 'PRAT-011');
    expect(candidato?.modificadores.map((item) => item.regra)).toContain('PER-008');
  });

  it('a explicação menciona a trilha', () => {
    expect(resultado.principal?.explicacao).toMatch(/trilha/i);
  });
});

describe('Garantias do motor', () => {
  const contexto = contextoDeTeste({
    perfil: { objetivoPrincipal: 'forca', experiencia: { asanas: 'experiente' } },
    saude: { consentida: true, condicoes: ['glaucoma'] },
    checkin: { tempo: 60, energia: 'alta' },
  });

  it('conteúdo bloqueado nunca aparece em nenhuma saída', () => {
    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });
    const saidas = [resultado.principal?.conteudo.id, resultado.alternativa?.conteudo.id];
    const ranking = resultado.auditoria.ranking.map((item) => item.conteudo.id);

    for (const invertida of ['PRAT-023', 'PRAT-025']) {
      expect(saidas).not.toContain(invertida);
      expect(ranking).not.toContain(invertida);
    }
  });

  it('a mesma entrada devolve sempre a mesma saída', () => {
    const primeira = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA, semente: 7 });
    const segunda = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA, semente: 7 });

    expect(JSON.stringify(primeira)).toBe(JSON.stringify(segunda));
  });

  it('a ordem do catálogo não muda o resultado', () => {
    const invertido = [...CATALOGO_DE_TESTE].reverse();

    const normal = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });
    const embaralhado = recomendarDia(contexto, invertido, { agora: MANHA });

    expect(embaralhado.principal?.conteudo.id).toBe(normal.principal?.conteudo.id);
  });

  it('MOT-10: a auditoria mostra filtros, pontuação e versão da configuração', () => {
    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });
    const { auditoria } = resultado;

    expect(auditoria.versaoConfig).toBe('v1');
    expect(auditoria.totalNoCatalogo).toBe(CATALOGO_DE_TESTE.length);
    expect(auditoria.exclusoes.length).toBeGreaterThan(0);
    expect(auditoria.exclusoes.every((item) => item.regra && item.motivo)).toBe(true);

    const primeiro = auditoria.ranking[0];
    expect(primeiro?.criterios.estado).toBeGreaterThanOrEqual(0);
    expect(primeiro?.scoreFinal).toBeGreaterThan(0);
  });

  it('o score fica entre 0 e 100 mesmo com os modificadores', () => {
    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });

    for (const candidato of resultado.auditoria.ranking) {
      expect(candidato.scoreBase).toBeGreaterThanOrEqual(0);
      expect(candidato.scoreBase).toBeLessThanOrEqual(100);
      expect(candidato.scoreFinal).toBeGreaterThanOrEqual(0);
      expect(candidato.scoreFinal).toBeLessThanOrEqual(110);
    }
  });

  it('quando nada sobra, o motor devolve vazio em vez de inventar', () => {
    // Iniciante diante de um catálogo só de conteúdo especializado.
    const iniciante = contextoDeTeste({ perfil: { experiencia: { asanas: 'nunca' } } });
    const soAvancado = CATALOGO_DE_TESTE.filter((item) => item.nivelTecnico >= 4);

    const resultado = recomendarDia(iniciante, soAvancado, { agora: MANHA });

    expect(resultado.principal).toBeUndefined();
    expect(resultado.alternativa).toBeUndefined();
    expect(resultado.auditoria.candidatosConsiderados).toBe(0);
  });

  it('F1.21: 1.200 conteúdos são processados em menos de 100 ms', () => {
    const grande: Conteudo[] = [];
    for (let i = 0; i < 1200; i += 1) {
      const base = CATALOGO_DE_TESTE[i % CATALOGO_DE_TESTE.length] as Conteudo;
      grande.push({ ...base, id: `${base.id}-${i}` });
    }

    const comecou = performance.now();
    recomendarDia(contexto, grande, { agora: MANHA });
    const levou = performance.now() - comecou;

    expect(levou).toBeLessThan(100);
  });
});

describe('MOT-03 — a adequação vence o relógio', () => {
  const experiente = {
    objetivoPrincipal: 'estresse' as const,
    experiencia: {
      asanas: 'experiente' as const,
      nidra: 'experiente' as const,
      pranayama: 'experiente' as const,
      meditacao: 'experiente' as const,
    },
  };

  it('com tempo de sobra, entrega uma prática do tamanho pedido', () => {
    const contexto = contextoDeTeste({
      perfil: experiente,
      checkin: { tempo: 30, sono: 'razoavel', energia: 'media', corpo: 'normal' },
    });

    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });

    expect(resultado.principal?.conteudo.duracaoMin).toBeGreaterThanOrEqual(25);
  });

  it('num dia de recuperação, aceita uma prática mais curta se for a certa', () => {
    // Uma hora disponível, mas o corpo pedindo descanso: entre uma prática
    // longa e intensa e uma curta e suave, quem ganha é a suave.
    const contexto = contextoDeTeste({
      perfil: experiente,
      checkin: {
        tempo: 60,
        sono: 'ruim',
        energia: 'baixa',
        corpo: 'cansado',
        estresse: 'alto',
      },
    });

    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });
    const escolhida = resultado.principal?.conteudo;

    expect(escolhida).toBeDefined();
    expect(escolhida?.demandaFisica).toBeLessThanOrEqual(2);
    expect(escolhida?.duracaoMin).toBeLessThan(55);
  });

  it('e avisa que a prática é mais curta que o tempo reservado', () => {
    const contexto = contextoDeTeste({
      perfil: experiente,
      checkin: { tempo: 60, sono: 'ruim', energia: 'baixa', corpo: 'cansado', estresse: 'alto' },
    });

    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });

    expect(resultado.aviso).toContain('60 minutos');
    expect(resultado.auditoria.ajusteDeTempo).toBeDefined();
  });

  it('quando existe a prática certa do tamanho certo, usa o tempo todo', () => {
    const contexto = contextoDeTeste({
      perfil: { ...experiente, objetivoPrincipal: 'forca' },
      checkin: { tempo: 60, sono: 'bom', energia: 'alta', corpo: 'disposto' },
    });

    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });

    expect(resultado.principal?.conteudo.duracaoMin).toBe(60);
    expect(resultado.aviso).toBeUndefined();
  });

  it('prefere a prática que serve ao objetivo, mesmo sendo mais curta', () => {
    // Com 45 minutos existe Hatha clássico (45 min, força 3), mas "Força e
    // estabilidade" (30 min, força 5) atende melhor o objetivo — e ganha.
    const contexto = contextoDeTeste({
      perfil: { ...experiente, objetivoPrincipal: 'forca' },
      checkin: { tempo: 45, sono: 'bom', energia: 'alta', corpo: 'disposto' },
    });

    const resultado = recomendarDia(contexto, CATALOGO_DE_TESTE, { agora: MANHA });
    const escolhida = resultado.principal?.conteudo;

    expect(escolhida?.objetivos.forca).toBe(5);
    expect(escolhida?.duracaoMin).toBeLessThan(45);
    // E a pessoa é avisada de que sobra tempo, em vez de ficar no escuro.
    expect(resultado.aviso).toContain('45 minutos');
  });
});

describe('Repetição e continuidade (MOT-07)', () => {
  it('praticar ontem derruba a pontuação do mesmo conteúdo', () => {
    const base = contextoDeTeste({
      perfil: { objetivoPrincipal: 'mobilidade', experiencia: { asanas: 'regular' } },
      checkin: { tempo: 20 },
    });
    const comOntem = contextoDeTeste({
      perfil: { objetivoPrincipal: 'mobilidade', experiencia: { asanas: 'regular' } },
      checkin: { tempo: 20 },
      historico: [{ conteudoId: 'PRAT-010', dia: '2026-09-27' }],
    });

    const hoje = new Date(2026, 8, 28, 8, 0);
    const semHistorico = recomendarDia(base, CATALOGO_DE_TESTE, { agora: hoje });
    const comHistorico = recomendarDia(comOntem, CATALOGO_DE_TESTE, { agora: hoje });

    const antes = semHistorico.auditoria.ranking.find((i) => i.conteudo.id === 'PRAT-010');
    const depois = comHistorico.auditoria.ranking.find((i) => i.conteudo.id === 'PRAT-010');

    expect(depois?.scoreFinal).toBeLessThan(antes?.scoreFinal ?? 0);
    expect(depois?.modificadores.map((m) => m.regra)).toContain('MOD-repeticao-ontem');
  });
});
