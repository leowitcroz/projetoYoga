import { beforeEach, describe, expect, it } from 'vitest';
import {
  carregarCheckin,
  checkin,
  diaDeHoje,
  escolherTempo,
  informarLocalDaDor,
  marcarEnviado,
  recomecar,
  responder,
  temDor,
} from './checkin-do-dia.js';

describe('check-in do dia', () => {
  beforeEach(async () => {
    localStorage.clear();
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

  it('anota quando a pessoa mandou atualizar a prática', async () => {
    expect(checkin.enviadoEm).toBeUndefined();
    await marcarEnviado(new Date(2026, 8, 18, 8, 0));
    expect(checkin.enviadoEm).toBe(new Date(2026, 8, 18, 8, 0).toISOString());
  });
});
