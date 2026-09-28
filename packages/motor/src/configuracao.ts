import type { CondicaoDeSaude, PerfilDeEfeito, RegiaoDaDor, StatusSeguranca } from '@life/shared';

/**
 * Configuração do Motor LIFE, versão 1.
 *
 * Tudo aqui é transcrição direta da Matriz Técnica 1.1, com os IDs originais.
 * Nada de número solto no meio do código: quem quiser mudar um peso mexe aqui,
 * e o resultado continua rastreável até o documento do cliente.
 */

export type ChaveDeCarga =
  | 'cargaCervical'
  | 'cargaJoelho'
  | 'cargaLombar'
  | 'cargaOmbros'
  | 'cargaPunhos'
  | 'cargaQuadril'
  | 'riscoQueda'
  | 'demandaCardiovascular'
  | 'mudancaRapidaPosicao';

/** Uma linha do Bloco 1 da Matriz. */
export interface RegraSeguranca {
  id: string;
  /** O que aciona a regra: uma condição de saúde ou uma dor de hoje. */
  gatilho:
    | { tipo: 'condicao'; condicao: CondicaoDeSaude }
    | { tipo: 'dor'; regiao: RegiaoDaDor; intensidadeMinima: 'leve' | 'forte' };
  /** Campo do conteúdo que a regra observa. */
  campo: ChaveDeCarga | 'invertida' | 'retencaoRespiratoria' | 'gestacaoNaoRevisada';
  /** A partir de que valor a regra vale (para campos 0–3). */
  nivelGatilho: number;
  status: StatusSeguranca;
  descricao: string;
}

/** Uma linha do Bloco 2 da Matriz: o estado do dia modulando as dimensões. */
export interface RegraEstado {
  id: string;
  descricao: string;
  efeito: Partial<PerfilDeEfeito>;
}

export interface PesosDoRanking {
  estado: number;
  objetivoPrincipal: number;
  objetivosSecundarios: number;
  perfil: number;
  ayurveda: number;
  preferencias: number;
  historico: number;
}

export interface Modificadores {
  continuidade: number;
  repeticaoOntem: number;
  repeticaoTresDias: number;
  /** Fatia das sugestões secundárias reservada a conteúdo novo (MOT-07). */
  fatiaDeDescoberta: number;
}

export interface EngineConfig {
  versao: string;
  pesos: PesosDoRanking;
  modificadores: Modificadores;
  seguranca: RegraSeguranca[];
  estado: RegraEstado[];
  /** Demanda física máxima no modo conservador (MOT-12). */
  demandaMaximaConservadora: number;
  /** A partir de quantos dias seguidos com dor o motor avisa (SEG-R03). */
  diasParaPersistencia: number;
}

/** Bloco 1 — Segurança. Cada item é uma linha da aba 01 da Matriz. */
const seguranca: RegraSeguranca[] = [
  // Dor de hoje aciona o Bloco 1 mesmo sem condição cadastrada (SEG-R05).
  {
    id: 'SEG-001',
    gatilho: { tipo: 'dor', regiao: 'cervical', intensidadeMinima: 'leve' },
    campo: 'cargaCervical',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor cervical hoje: fora as práticas de carga cervical elevada',
  },
  {
    id: 'SEG-002',
    gatilho: { tipo: 'dor', regiao: 'cervical', intensidadeMinima: 'leve' },
    campo: 'cargaCervical',
    nivelGatilho: 2,
    status: 'adaptar',
    descricao: 'Dor cervical hoje: usar versão adaptada quando houver',
  },
  {
    id: 'SEG-009',
    gatilho: { tipo: 'dor', regiao: 'joelhos', intensidadeMinima: 'leve' },
    campo: 'cargaJoelho',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor no joelho hoje: fora as práticas de carga elevada no joelho',
  },
  {
    id: 'SEG-009b',
    gatilho: { tipo: 'dor', regiao: 'joelhos', intensidadeMinima: 'leve' },
    campo: 'cargaJoelho',
    nivelGatilho: 2,
    status: 'adaptar',
    descricao: 'Dor no joelho hoje: adaptar carga no joelho',
  },
  {
    id: 'SEG-R05-lombar',
    gatilho: { tipo: 'dor', regiao: 'lombar', intensidadeMinima: 'leve' },
    campo: 'cargaLombar',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor lombar hoje: fora as práticas de carga lombar elevada',
  },
  {
    id: 'SEG-R05-ombros',
    gatilho: { tipo: 'dor', regiao: 'ombros', intensidadeMinima: 'leve' },
    campo: 'cargaOmbros',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor nos ombros hoje: fora as práticas de carga elevada nos ombros',
  },
  {
    id: 'SEG-R05-punhos',
    gatilho: { tipo: 'dor', regiao: 'punhos', intensidadeMinima: 'leve' },
    campo: 'cargaPunhos',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor nos punhos hoje: fora as práticas de apoio nas mãos',
  },
  {
    id: 'SEG-R05-quadril',
    gatilho: { tipo: 'dor', regiao: 'quadril', intensidadeMinima: 'leve' },
    campo: 'cargaQuadril',
    nivelGatilho: 3,
    status: 'bloquear',
    descricao: 'Dor no quadril hoje: fora as práticas de carga elevada no quadril',
  },
  {
    id: 'SEG-R05-cabeca',
    gatilho: { tipo: 'dor', regiao: 'cabeca', intensidadeMinima: 'leve' },
    campo: 'invertida',
    nivelGatilho: 1,
    status: 'bloquear',
    descricao: 'Dor de cabeça hoje: fora as invertidas',
  },
  // Condições do cadastro.
  {
    id: 'SEG-003',
    gatilho: { tipo: 'condicao', condicao: 'glaucoma' },
    campo: 'invertida',
    nivelGatilho: 1,
    status: 'bloquear',
    descricao: 'Condição ocular: invertidas completas não entram na recomendação automática',
  },
  {
    id: 'SEG-004',
    gatilho: { tipo: 'condicao', condicao: 'tontura' },
    campo: 'mudancaRapidaPosicao',
    nivelGatilho: 2,
    status: 'adaptar',
    descricao: 'Tontura: reduzir transições rápidas',
  },
  {
    id: 'SEG-005',
    gatilho: { tipo: 'condicao', condicao: 'tontura' },
    campo: 'riscoQueda',
    nivelGatilho: 2,
    status: 'bloquear',
    descricao: 'Tontura: fora o conteúdo com risco de queda',
  },
  {
    id: 'SEG-006',
    gatilho: { tipo: 'condicao', condicao: 'hipertensao' },
    campo: 'retencaoRespiratoria',
    nivelGatilho: 1,
    status: 'bloquear',
    descricao: 'Pressão elevada: retenção respiratória não entra na recomendação automática',
  },
  {
    id: 'SEG-006c',
    gatilho: { tipo: 'condicao', condicao: 'cardiacas' },
    campo: 'retencaoRespiratoria',
    nivelGatilho: 1,
    status: 'bloquear',
    descricao: 'Condição cardiovascular: retenção respiratória fora da recomendação automática',
  },
  {
    id: 'SEG-007',
    gatilho: { tipo: 'condicao', condicao: 'hipertensao' },
    campo: 'demandaCardiovascular',
    nivelGatilho: 3,
    status: 'atencao',
    descricao: 'Pressão elevada: reduzir prioridade da demanda cardiovascular alta',
  },
  {
    id: 'SEG-007c',
    gatilho: { tipo: 'condicao', condicao: 'cardiacas' },
    campo: 'demandaCardiovascular',
    nivelGatilho: 3,
    status: 'atencao',
    descricao: 'Condição cardiovascular: reduzir prioridade da demanda alta',
  },
  {
    id: 'SEG-008',
    gatilho: { tipo: 'condicao', condicao: 'gestacao' },
    campo: 'gestacaoNaoRevisada',
    nivelGatilho: 1,
    status: 'bloquear',
    descricao: 'Gestação: somente conteúdo revisado para gestação',
  },
  {
    id: 'SEG-010',
    gatilho: { tipo: 'condicao', condicao: 'cirurgia-recente' },
    campo: 'demandaCardiovascular',
    nivelGatilho: 2,
    status: 'bloquear',
    descricao: 'Cirurgia recente: regra conservadora até orientação profissional',
  },
];

/**
 * Bloco 2 — Estado do dia.
 *
 * A Matriz foi escrita para escalas de 1 a 5; o check-in do app tem três
 * opções por pergunta. A tradução está em `estado.ts`, junto das regras, para
 * ficar visível — e continua pendente de validação do cliente.
 */
const estado: RegraEstado[] = [
  {
    id: 'EST-001',
    descricao: 'Sono ruim',
    efeito: {
      intensidade: -3,
      mobilidade: 2,
      respiracaoCalma: 2,
      yogaNidra: 3,
      relaxamento: 3,
      ativacao: -2,
    },
  },
  { id: 'EST-002', descricao: 'Sono razoável', efeito: {} },
  { id: 'EST-003', descricao: 'Sono bom', efeito: { intensidade: 1, ativacao: 1 } },
  {
    id: 'EST-004',
    descricao: 'Energia baixa',
    efeito: {
      intensidade: -3,
      mobilidade: 1,
      respiracaoCalma: 1,
      yogaNidra: 2,
      relaxamento: 2,
      ativacao: -2,
    },
  },
  {
    id: 'EST-005',
    descricao: 'Energia alta',
    efeito: { intensidade: 2, yogaNidra: -1, relaxamento: -1, ativacao: 3 },
  },
  {
    id: 'EST-006',
    descricao: 'Estresse alto',
    efeito: {
      intensidade: -2,
      mobilidade: 2,
      respiracaoCalma: 3,
      yogaNidra: 3,
      relaxamento: 3,
      ativacao: -2,
    },
  },
  {
    id: 'EST-007',
    descricao: 'Corpo rígido',
    efeito: { intensidade: -1, mobilidade: 4, respiracaoCalma: 1, relaxamento: 1 },
  },
  {
    id: 'EST-008',
    descricao: 'Corpo muito cansado',
    efeito: {
      intensidade: -4,
      mobilidade: 1,
      respiracaoCalma: 2,
      yogaNidra: 3,
      relaxamento: 3,
      ativacao: -3,
    },
  },
  {
    id: 'EST-009',
    descricao: 'Digestão pesada',
    efeito: {
      intensidade: -2,
      mobilidade: 1,
      respiracaoCalma: 1,
      yogaNidra: 1,
      relaxamento: 1,
      ativacao: -1,
    },
  },
  {
    id: 'EST-010',
    descricao: 'Noite',
    efeito: { intensidade: -1, respiracaoCalma: 2, yogaNidra: 3, relaxamento: 3, ativacao: -2 },
  },
  {
    id: 'EST-011',
    descricao: 'Manhã',
    efeito: { intensidade: 1, mobilidade: 1, yogaNidra: -1, ativacao: 2 },
  },
  {
    // Regra nova: humor não existe na Matriz 1.1, entrou no check-in em 18/09.
    // Efeito conservador, inspirado no EST-006. Pendente de validação.
    id: 'EST-012',
    descricao: 'Humor abatido',
    efeito: { intensidade: -1, respiracaoCalma: 2, relaxamento: 2, yogaNidra: 1 },
  },
];

export const CONFIG_V1: EngineConfig = {
  versao: 'v1',
  // Aba 05 da Matriz. Somam 100.
  pesos: {
    estado: 30,
    objetivoPrincipal: 25,
    objetivosSecundarios: 10,
    perfil: 10,
    ayurveda: 10,
    preferencias: 10,
    historico: 5,
  },
  modificadores: {
    continuidade: 10,
    repeticaoOntem: -15,
    repeticaoTresDias: -8,
    fatiaDeDescoberta: 0.15,
  },
  seguranca,
  estado,
  demandaMaximaConservadora: 2,
  diasParaPersistencia: 3,
};
