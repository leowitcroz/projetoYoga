import { chamar } from './api.js';
import type { StatusDoConteudo } from './conteudos.js';

/** Trilhas: práticas feitas para serem percorridas em ordem (ADM-05). */

export interface TrilhaResumida {
  id: string;
  nome: string;
}

export interface TrilhaNaLista extends TrilhaResumida {
  descricao: string | null;
  totalAulas: number;
  aulasCadastradas: number;
  autor: { nome: string } | null;
  preRequisito: TrilhaResumida | null;
  atualizadoEm: string;
  /** O que impede a trilha de chegar inteira ao aluno. */
  problemas: string[];
}

export interface AulaDaTrilha {
  id: string;
  titulo: string;
  modalidade: string;
  duracaoMin: number;
  status: StatusDoConteudo;
  ordemTrilha?: number | null;
}

export interface TrilhaCompleta extends TrilhaNaLista {
  preRequisitoId: string | null;
  aulas: AulaDaTrilha[];
  /** Práticas que não estão em trilha nenhuma e podem entrar nesta. */
  disponiveis: AulaDaTrilha[];
}

export interface FichaDaTrilha {
  nome: string;
  descricao?: string;
  totalAulas: number;
  preRequisitoId?: string;
}

export function listarTrilhas(): Promise<TrilhaNaLista[]> {
  return chamar<TrilhaNaLista[]>('/painel/trilhas');
}

export function buscarTrilha(id: string): Promise<TrilhaCompleta> {
  return chamar<TrilhaCompleta>(`/painel/trilhas/${id}`);
}

/** As que podem virar pré-requisito sem fechar um ciclo. */
export function listarPreRequisitos(id?: string): Promise<TrilhaResumida[]> {
  return chamar<TrilhaResumida[]>(`/painel/trilhas/pre-requisitos${id ? `?trilha=${id}` : ''}`);
}

export function criarTrilha(ficha: FichaDaTrilha) {
  return chamar<{ id: string }>('/painel/trilhas', { metodo: 'POST', corpo: ficha });
}

export function atualizarTrilha(id: string, ficha: FichaDaTrilha) {
  return chamar<{ id: string }>(`/painel/trilhas/${id}`, { metodo: 'PUT', corpo: ficha });
}

/** Manda a lista inteira na ordem desejada; a API numera de 1 em diante. */
export function definirOrdem(id: string, aulas: string[]) {
  return chamar<TrilhaCompleta>(`/painel/trilhas/${id}/aulas`, {
    metodo: 'PUT',
    corpo: { aulas },
  });
}

export function removerTrilha(id: string) {
  return chamar(`/painel/trilhas/${id}`, { metodo: 'DELETE' });
}

export function fichaDeTrilhaEmBranco(): FichaDaTrilha {
  return { nome: '', descricao: '', totalAulas: 4 };
}
