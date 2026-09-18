import { reactive } from 'vue';
import type { ChaveCheckin } from '@/dados/checkin';
import { guardar, ler } from './armazenamento.js';

/**
 * Check-in do dia guardado no aparelho.
 *
 * Enquanto o motor não existe (Fase 1) e a API não guarda check-in (F2.14),
 * as respostas ficam aqui: assim a pessoa não refaz o check-in toda vez que
 * abre o app, e pode corrigir uma resposta no mesmo dia (CHK-04).
 */
export interface CheckinDoDia {
  /** Data no formato AAAA-MM-DD, pelo relógio do aparelho (CHK-02). */
  dia: string;
  respostas: Partial<Record<ChaveCheckin, string>>;
  /** Onde dói, perguntado só quando há dor (CHK-03). */
  localDaDor?: string;
  tempo?: number;
  /** Momento em que a pessoa mandou atualizar a prática. */
  enviadoEm?: string;
}

const CHAVE = 'life.checkin';

export function diaDeHoje(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export const checkin = reactive<CheckinDoDia>({ dia: diaDeHoje(), respostas: {} });

/** Lê o check-in guardado. Se for de outro dia, começa um novo (CHK-06). */
export async function carregarCheckin(agora: Date = new Date()): Promise<void> {
  const salvo = await ler<CheckinDoDia>(CHAVE);
  const hoje = diaDeHoje(agora);

  if (salvo && salvo.dia === hoje) {
    checkin.dia = salvo.dia;
    checkin.respostas = salvo.respostas ?? {};
    checkin.localDaDor = salvo.localDaDor;
    checkin.tempo = salvo.tempo;
    checkin.enviadoEm = salvo.enviadoEm;
    return;
  }

  checkin.dia = hoje;
  checkin.respostas = {};
  checkin.localDaDor = undefined;
  checkin.tempo = undefined;
  checkin.enviadoEm = undefined;
}

export async function responder(id: ChaveCheckin, valor: string): Promise<void> {
  checkin.respostas[id] = valor;
  // Quem diz que não tem dor não guarda região nenhuma.
  if (id === 'dor' && valor === 'nenhuma') checkin.localDaDor = undefined;
  await salvar();
}

export async function informarLocalDaDor(regiao: string): Promise<void> {
  checkin.localDaDor = regiao;
  await salvar();
}

/** Há dor a tratar? O motor usa isto para reaplicar a segurança (CHK-03). */
export function temDor(): boolean {
  const dor = checkin.respostas.dor;
  return dor !== undefined && dor !== 'nenhuma';
}

export async function escolherTempo(minutos: number): Promise<void> {
  checkin.tempo = minutos;
  await salvar();
}

export async function marcarEnviado(agora: Date = new Date()): Promise<void> {
  checkin.enviadoEm = agora.toISOString();
  await salvar();
}

/** Apaga as respostas do dia para a pessoa refazer o check-in do zero. */
export async function recomecar(agora: Date = new Date()): Promise<void> {
  checkin.dia = diaDeHoje(agora);
  checkin.respostas = {};
  checkin.localDaDor = undefined;
  checkin.tempo = undefined;
  checkin.enviadoEm = undefined;
  await salvar();
}

async function salvar(): Promise<void> {
  await guardar(CHAVE, {
    dia: checkin.dia,
    respostas: checkin.respostas,
    localDaDor: checkin.localDaDor,
    tempo: checkin.tempo,
    enviadoEm: checkin.enviadoEm,
  });
}
