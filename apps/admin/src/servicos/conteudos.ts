import { chamar } from './api.js';

/** O catálogo pelo lado de quem cataloga (ADM-02). */

export type StatusDoConteudo = 'RASCUNHO' | 'EM_REVISAO' | 'APROVADO' | 'DEVOLVIDO';

export interface ConteudoNaLista {
  id: string;
  titulo: string;
  modalidade: string;
  duracaoMin: number;
  nivelTecnico: number;
  status: StatusDoConteudo;
  comentarioRevisao: string | null;
  atualizadoEm: string;
  autor: { nome: string } | null;
  trilha: { id: string; nome: string } | null;
  ordemTrilha: number | null;
}

export interface FichaDaPratica {
  titulo: string;
  modalidade: string;
  area: string;
  duracaoMin: number;
  nivelTecnico: number;
  demandaFisica: number;
  professor?: string;
  capaUrl?: string;
  videoUrl?: string;
  objetivos: Record<string, number>;
  caracteristicas: {
    intensidade: number;
    mobilidade: number;
    respiracaoCalma: number;
    yogaNidra: number;
    relaxamento: number;
    ativacao: number;
  };
  seguranca: {
    cargaCervical: number;
    cargaJoelho: number;
    cargaLombar: number;
    cargaOmbros: number;
    cargaPunhos: number;
    cargaQuadril: number;
    riscoQueda: number;
    demandaCardiovascular: number;
    mudancaRapidaPosicao: number;
    invertida: boolean;
    retencaoRespiratoria: boolean;
    revisadoParaGestacao?: boolean;
    temVersaoAdaptada?: boolean;
    publicoEspecifico?: string;
  };
  ayurveda?: Record<string, number>;
  /** A posição dentro da trilha é da tela da trilha, não desta ficha. */
  trilhaId?: string;
}

export function listarConteudos(): Promise<ConteudoNaLista[]> {
  return chamar<ConteudoNaLista[]>('/painel/conteudos');
}

export function listarFila(): Promise<ConteudoNaLista[]> {
  return chamar<ConteudoNaLista[]>('/painel/conteudos/fila');
}

export function buscarConteudo(id: string): Promise<Record<string, unknown>> {
  return chamar<Record<string, unknown>>(`/painel/conteudos/${id}`);
}

export function criarConteudo(ficha: FichaDaPratica) {
  return chamar<{ id: string }>('/painel/conteudos', { metodo: 'POST', corpo: ficha });
}

export function atualizarConteudo(id: string, ficha: FichaDaPratica) {
  return chamar<{ id: string }>(`/painel/conteudos/${id}`, { metodo: 'PUT', corpo: ficha });
}

export function enviarParaRevisao(id: string) {
  return chamar(`/painel/conteudos/${id}/revisao`, { metodo: 'POST' });
}

export function aprovar(id: string) {
  return chamar(`/painel/conteudos/${id}/aprovacao`, { metodo: 'POST' });
}

export function devolver(id: string, comentario: string) {
  return chamar(`/painel/conteudos/${id}/devolucao`, { metodo: 'POST', corpo: { comentario } });
}

/** Ficha vazia, com os valores que fazem uma prática neutra. */
export function fichaEmBranco(): FichaDaPratica {
  return {
    titulo: '',
    modalidade: 'hatha',
    area: 'asanas',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 2,
    professor: '',
    objetivos: {},
    caracteristicas: {
      intensidade: 0,
      mobilidade: 0,
      respiracaoCalma: 0,
      yogaNidra: 0,
      relaxamento: 0,
      ativacao: 0,
    },
    seguranca: {
      cargaCervical: 0,
      cargaJoelho: 0,
      cargaLombar: 0,
      cargaOmbros: 0,
      cargaPunhos: 0,
      cargaQuadril: 0,
      riscoQueda: 0,
      demandaCardiovascular: 0,
      mudancaRapidaPosicao: 0,
      invertida: false,
      retencaoRespiratoria: false,
      revisadoParaGestacao: false,
      temVersaoAdaptada: false,
    },
    ayurveda: {},
  };
}

export const NOME_DO_STATUS: Record<StatusDoConteudo, string> = {
  RASCUNHO: 'Rascunho',
  EM_REVISAO: 'Em revisão',
  APROVADO: 'Aprovado',
  DEVOLVIDO: 'Devolvido',
};
