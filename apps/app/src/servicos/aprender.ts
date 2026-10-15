import { chamar } from './api.js';

/** O Aprender pelo lado do aluno (EDU-01 a EDU-06). */

export type TipoDeAula = 'video' | 'audio' | 'texto';

export interface CursoResumido {
  id: string;
  titulo: string;
  descricao: string | null;
  tema: string;
  nivel: number;
  capaUrl: string | null;
  professor: string | null;
  totalAulas: number;
}

export interface AulaResumida {
  id: string;
  titulo: string;
  ordem: number;
  tipo: TipoDeAula;
  duracaoMin: number;
  concluida?: boolean;
}

export interface AulaDoDia extends AulaResumida {
  descricao: string | null;
  temVideo: boolean;
  curso: {
    id: string;
    titulo: string;
    professor: string | null;
    tema: string;
    nivel: number;
    capaUrl: string | null;
  };
}

export interface ContinueEstudando {
  curso: Omit<CursoResumido, 'totalAulas'>;
  proxima: AulaResumida;
  totalAulas: number;
  concluidas: number;
}

export interface InicioDoAprender {
  aulaDoDia: AulaDoDia | null;
  continueEstudando: ContinueEstudando | null;
  recomendados: { porTema: boolean; cursos: CursoResumido[] };
}

export interface CursoCompleto extends CursoResumido {
  concluidas: number;
  aulas: AulaResumida[];
}

export interface AulaCompleta extends AulaResumida {
  descricao: string | null;
  videoProvedor: string | null;
  videoId: string | null;
  texto: string | null;
  concluida: boolean;
  curso: { id: string; titulo: string; professor: string | null; tema: string; nivel: number };
}

export interface FiltrosDeCursos {
  tema?: string;
  nivel?: number;
  tipo?: string;
  busca?: string;
}

export interface FiltrosDisponiveis {
  total: number;
  temas: Record<string, number>;
  niveis: number[];
  tipos: string[];
}

/** O dia no fuso do aparelho: é ele que decide qual é a aula de hoje. */
export function diaDeHoje(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function buscarInicio(dia = diaDeHoje()): Promise<InicioDoAprender> {
  return chamar<InicioDoAprender>(`/aprender/inicio?dia=${dia}`);
}

export function listarCursos(filtros: FiltrosDeCursos = {}): Promise<CursoResumido[]> {
  const parametros = new URLSearchParams();
  if (filtros.tema) parametros.set('tema', filtros.tema);
  if (filtros.nivel) parametros.set('nivel', String(filtros.nivel));
  if (filtros.tipo) parametros.set('tipo', filtros.tipo);
  if (filtros.busca) parametros.set('busca', filtros.busca);

  const busca = parametros.toString();
  return chamar<CursoResumido[]>(`/aprender/cursos${busca ? `?${busca}` : ''}`);
}

export function buscarFiltros(): Promise<FiltrosDisponiveis> {
  return chamar<FiltrosDisponiveis>('/aprender/cursos/filtros');
}

export function buscarCurso(id: string): Promise<CursoCompleto> {
  return chamar<CursoCompleto>(`/aprender/cursos/${encodeURIComponent(id)}`);
}

export function buscarAula(id: string): Promise<AulaCompleta> {
  return chamar<AulaCompleta>(`/aprender/aulas/${encodeURIComponent(id)}`);
}

export function concluirAula(id: string) {
  return chamar(`/aprender/aulas/${encodeURIComponent(id)}/conclusao`, { metodo: 'POST' });
}

/** Nomes que aparecem na tela, no lugar dos códigos do banco. */
export const NOME_DO_TEMA: Record<string, string> = {
  fisiologia: 'Fisiologia',
  filosofia: 'Filosofia',
  yoga: 'Yoga',
  ayurveda: 'Ayurveda',
  classicos: 'Clássicos',
};

export const NOME_DO_TIPO: Record<string, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  texto: 'Leitura',
};

export function nomeDoNivel(nivel: number): string {
  if (nivel <= 1) return 'Introdutório';
  if (nivel === 2) return 'Básico';
  if (nivel === 3) return 'Intermediário';
  if (nivel === 4) return 'Avançado';
  return 'Especializado';
}
