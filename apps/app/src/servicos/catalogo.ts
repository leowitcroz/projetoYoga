import { chamar } from './api.js';

/**
 * A biblioteca de aulas.
 *
 * Diferente da recomendação: aqui a pessoa escolhe sozinha e vê tudo o que
 * está aprovado, inclusive o que o motor não sugeriu hoje (SEG-R02).
 */

export interface AulaDaLista {
  id: string;
  titulo: string;
  modalidade: string;
  duracaoMin: number;
  nivelTecnico: number;
  demandaFisica: number;
  objetivos: Record<string, number>;
}

export interface Aula extends AulaDaLista {
  area: string;
  trilhaId?: string | null;
  ordemTrilha?: number | null;
}

export interface FiltrosDoCatalogo {
  modalidade?: string;
  duracaoMax?: number;
  objetivo?: string;
}

export function listarAulas(filtros: FiltrosDoCatalogo = {}): Promise<AulaDaLista[]> {
  const parametros = new URLSearchParams();
  if (filtros.modalidade) parametros.set('modalidade', filtros.modalidade);
  if (filtros.duracaoMax) parametros.set('duracaoMax', String(filtros.duracaoMax));
  if (filtros.objetivo) parametros.set('objetivo', filtros.objetivo);

  const busca = parametros.toString();
  return chamar<AulaDaLista[]>(`/catalogo${busca ? `?${busca}` : ''}`);
}

export function listarModalidades(): Promise<string[]> {
  return chamar<string[]>('/catalogo/modalidades');
}

export function buscarAula(id: string): Promise<Aula> {
  return chamar<Aula>(`/catalogo/${encodeURIComponent(id)}`);
}

/** Nomes que aparecem na tela, no lugar dos códigos do banco. */
export const NOME_DA_MODALIDADE: Record<string, string> = {
  hatha: 'Hatha',
  vinyasa: 'Vinyasa',
  ashtanga: 'Ashtanga',
  restaurativo: 'Restaurativo',
  yin: 'Yin Yoga',
  nidra: 'Yoga Nidra',
  pranayama: 'Pranáyama',
  meditacao: 'Meditação',
  mobilidade: 'Mobilidade',
};

export const NOME_DO_OBJETIVO: Record<string, string> = {
  mobilidade: 'Mobilidade',
  flexibilidade: 'Flexibilidade',
  forca: 'Força',
  estresse: 'Reduzir estresse',
  sono: 'Dormir melhor',
  respiracao: 'Respiração',
  meditacao: 'Meditação',
  disposicao: 'Disposição',
  ayurveda: 'Ayurveda',
  filosofia: 'Filosofia',
  pratica: 'Aprofundar a prática',
  formacao: 'Formação',
};

/** 1 a 5 vira uma palavra que a pessoa entende. */
export function nomeDoNivel(nivel: number): string {
  if (nivel <= 1) return 'Introdutório';
  if (nivel === 2) return 'Básico';
  if (nivel === 3) return 'Intermediário';
  if (nivel === 4) return 'Avançado';
  return 'Especializado';
}

export function nomeDaIntensidade(demanda: number): string {
  if (demanda <= 1) return 'Muito suave';
  if (demanda === 2) return 'Suave';
  if (demanda === 3) return 'Moderada';
  if (demanda === 4) return 'Intensa';
  return 'Muito intensa';
}
