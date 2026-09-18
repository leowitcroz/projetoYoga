import { beforeEach, describe, expect, it } from 'vitest';
import { sessao } from './sessao.js';
import {
  carregarCheckin,
  checkin,
  diaDeHoje,
  escolherTempo,
  esquecerCheckin,
  informarLocalDaDor,
  marcarEnviado,
  recomecar,
  responder,
  temDor,
} from './checkin-do-dia.js';

function entrarComo(id: string) {
  sessao.value = {
    accessToken: 'a',
    refreshToken: 'r',
    expiraEm: Date.now() + 60000,
    usuario: { id, nome: 'Pessoa de Teste', email: `${id}@life.local` },
  };
}

describe('check-in do dia', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessao.value = null;
    await recomecar();
  });

  it('monta a data do jeito que o banco espera', () => {
    expect(diaDeHoje(new Date(2026, 8, 5, 10, 0))).toBe('2026-09-05');
    expect(diaDeHoje(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('guarda as respostas e o tempo', async () => {
    await responder('sono', 'bom');
    await responder('energia', 'media');
    await escolherTempo(30);

    expect(checkin.respostas.sono).toBe('bom');
    expect(checkin.respostas.energia).toBe('media');
    expect(checkin.tempo).toBe(30);
  });

  it('recupera o que foi respondido no mesmo dia', async () => {
    await responder('humor', 'equilibrado');
    await escolherTempo(20);

    checkin.respostas = {};
    checkin.tempo = undefined;
    await carregarCheckin();

    expect(checkin.respostas.humor).toBe('equilibrado');
    expect(checkin.tempo).toBe(20);
  });

  it('começa do zero quando vira o dia (CHK-06)', async () => {
    await responder('sono', 'ruim');
    await escolherTempo(45);

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    await carregarCheckin(amanha);

    expect(checkin.respostas).toEqual({});
    expect(checkin.tempo).toBeUndefined();
    expect(checkin.dia).toBe(diaDeHoje(amanha));
  });

  it('guarda onde dói quando há dor (CHK-03)', async () => {
    await responder('dor', 'forte');
    expect(temDor()).toBe(true);

    await informarLocalDaDor('lombar');
    expect(checkin.localDaDor).toBe('lombar');

    await carregarCheckin();
    expect(checkin.localDaDor).toBe('lombar');
  });

  it('esquece a região se a pessoa disser que não dói mais', async () => {
    await responder('dor', 'leve');
    await informarLocalDaDor('joelhos');

    await responder('dor', 'nenhuma');

    expect(temDor()).toBe(false);
    expect(checkin.localDaDor).toBeUndefined();
  });

  it('não considera dor quem ainda não respondeu', async () => {
    expect(temDor()).toBe(false);
  });

  it('não mostra a uma conta o check-in de outra', async () => {
    entrarComo('pessoa-1');
    await responder('sono', 'bom');
    await escolherTempo(45);

    // outra pessoa cria conta e entra no mesmo aparelho
    entrarComo('pessoa-2');
    await carregarCheckin();

    expect(checkin.respostas).toEqual({});
    expect(checkin.tempo).toBeUndefined();

    // e a primeira continua com o que respondeu
    entrarComo('pessoa-1');
    await carregarCheckin();
    expect(checkin.respostas.sono).toBe('bom');
    expect(checkin.tempo).toBe(45);
  });

  it('tira o check-in do aparelho quando a pessoa sai da conta', async () => {
    entrarComo('pessoa-3');
    await responder('humor', 'abatido');

    await esquecerCheckin();

    expect(checkin.respostas).toEqual({});
    await carregarCheckin();
    expect(checkin.respostas).toEqual({});
  });

  it('anota quando a pessoa mandou atualizar a prática', async () => {
    expect(checkin.enviadoEm).toBeUndefined();
    await marcarEnviado(new Date(2026, 8, 18, 8, 0));
    expect(checkin.enviadoEm).toBe(new Date(2026, 8, 18, 8, 0).toISOString());
  });
});
