/**
 * Tipos do Motor LIFE, transcritos da Matriz Técnica 1.1.
 *
 * Ficam em `shared` porque a API, o app e o motor falam desta mesma língua.
 * Os IDs das regras (SEG-001, EST-005, PER-003...) são mantidos de propósito:
 * é assim que o código continua rastreável até o documento do cliente.
 */

/** Objetivos do cadastro (PER-001 e PER-002). */
export type Objetivo =
  | 'mobilidade'
  | 'flexibilidade'
  | 'forca'
  | 'estresse'
  | 'sono'
  | 'respiracao'
  | 'meditacao'
  | 'disposicao'
  | 'ayurveda'
  | 'filosofia'
  | 'pratica'
  | 'formacao';

/** Áreas de experiência, avaliadas separadamente (PER-003). */
export type AreaExperiencia =
  'asanas' | 'pranayama' | 'meditacao' | 'nidra' | 'kriyas' | 'filosofia' | 'ayurveda';

/** Escala de experiência por área (PER-003). */
export type NivelExperiencia = 'nunca' | 'basico' | 'regular' | 'experiente';

export type TipoConteudo = 'pratica' | 'aula' | 'audio' | 'receita';

export type Modalidade =
  | 'hatha'
  | 'vinyasa'
  | 'ashtanga'
  | 'restaurativo'
  | 'yin'
  | 'nidra'
  | 'pranayama'
  | 'meditacao'
  | 'mobilidade';

/** Resultado do filtro de segurança (Bloco 1). */
export type StatusSeguranca = 'livre' | 'atencao' | 'adaptar' | 'bloquear';

/**
 * Estado funcional do dia (Documento Mestre, seção 5; MOT-05).
 * É o que resume "como a pessoa está hoje" antes de pontuar as práticas.
 */
export type EstadoFuncional =
  'recuperacao' | 'tensao' | 'ativacao' | 'disponibilidade' | 'desaceleracao';

/** As seis dimensões que o estado do dia modula (aba 02 da Matriz). */
export interface PerfilDeEfeito {
  intensidade: number;
  mobilidade: number;
  respiracaoCalma: number;
  yogaNidra: number;
  relaxamento: number;
  ativacao: number;
}

/** Ficha do conteúdo (aba 07 da Matriz). */
export interface Conteudo {
  id: string;
  titulo: string;
  tipo: TipoConteudo;
  modalidade: Modalidade;
  duracaoMin: number;
  /** 1 introdutório → 5 especializado. Separado da demanda física. */
  nivelTecnico: 1 | 2 | 3 | 4 | 5;
  /** 1 muito baixa → 5 muito alta. */
  demandaFisica: 1 | 2 | 3 | 4 | 5;
  /** Área de experiência exigida, para o filtro de nível (PER-003). */
  area: AreaExperiencia;
  /** Objetivos atendidos, com peso relativo (0 a 5). */
  objetivos: Partial<Record<Objetivo, number>>;
  /** O quanto a prática entrega de cada dimensão do estado do dia (0 a 5). */
  caracteristicas: PerfilDeEfeito;

  // Campos de segurança (Bloco 1). Ausente = 0 / falso.
  cargaCervical?: 0 | 1 | 2 | 3;
  cargaJoelho?: 0 | 1 | 2 | 3;
  cargaLombar?: 0 | 1 | 2 | 3;
  cargaOmbros?: 0 | 1 | 2 | 3;
  cargaPunhos?: 0 | 1 | 2 | 3;
  cargaQuadril?: 0 | 1 | 2 | 3;
  riscoQueda?: 0 | 1 | 2 | 3;
  demandaCardiovascular?: 0 | 1 | 2 | 3;
  mudancaRapidaPosicao?: 0 | 1 | 2 | 3;
  invertida?: boolean;
  retencaoRespiratoria?: boolean;
  /** Conteúdo revisado para gestação (SEG-008). */
  revisadoParaGestacao?: boolean;
  /**
   * Conteúdo feito para um público específico. Quem não é desse público não
   * recebe: uma aula para gestantes não serve para quem não está grávida.
   */
  publicoEspecifico?: 'gestacao';
  /** Existe versão adaptada aprovada para usar no lugar (SEG-002). */
  temVersaoAdaptada?: boolean;

  ayurvedaTags?: Partial<Record<'vata' | 'pitta' | 'kapha', number>>;
  trilhaId?: string;
  ordemTrilha?: number;

  /** Só conteúdo aprovado entra na recomendação automática (MOT-02). */
  aprovado: boolean;
}

// --- Check-in do dia (CHK-01) ---

export type RespostaSono = 'ruim' | 'razoavel' | 'bom';
export type RespostaEnergia = 'baixa' | 'media' | 'alta';
export type RespostaCorpo = 'cansado' | 'normal' | 'disposto';
export type RespostaDor = 'nenhuma' | 'leve' | 'forte';
export type RespostaEstresse = 'tranquilo' | 'um-pouco-alto' | 'alto';
export type RespostaDigestao = 'pesada' | 'normal' | 'leve';
export type RespostaHumor = 'abatido' | 'oscilando' | 'equilibrado';

/** Onde dói, quando há dor (CHK-03). */
export type RegiaoDaDor =
  'lombar' | 'cervical' | 'ombros' | 'joelhos' | 'quadril' | 'punhos' | 'cabeca' | 'outra';

export interface Checkin {
  sono: RespostaSono;
  energia: RespostaEnergia;
  corpo: RespostaCorpo;
  dor: RespostaDor;
  regiaoDaDor?: RegiaoDaDor;
  estresse: RespostaEstresse;
  digestao: RespostaDigestao;
  humor: RespostaHumor;
  /** Minutos disponíveis hoje. */
  tempo: number;
}

// --- Contexto do usuário ---

/** Condições marcadas no passo 3 do cadastro (ONB-04). */
export type CondicaoDeSaude =
  | 'cardiacas'
  | 'respiratorios'
  | 'diabetes'
  | 'hipertensao'
  | 'articulares'
  | 'gastrointestinais'
  | 'ansiedade'
  | 'glaucoma'
  | 'gestacao'
  | 'tontura'
  | 'cirurgia-recente'
  | 'outras';

export interface PerfilUsuario {
  objetivoPrincipal?: Objetivo;
  objetivosSecundarios: Objetivo[];
  experiencia: Partial<Record<AreaExperiencia, NivelExperiencia>>;
  /** Modalidades preferidas (PER-004). */
  modalidadesPreferidas: Modalidade[];
  constituicao?: 'vata' | 'pitta' | 'kapha';
  estadoAyurvedico?: 'equilibrio' | 'leve' | 'evidente';
}

export interface SaudeUsuario {
  /** Sem consentimento de saúde o motor entra em modo conservador (MOT-12). */
  consentida: boolean;
  condicoes: CondicaoDeSaude[];
}

/** Um dia já praticado, usado pelos modificadores (MOT-07). */
export interface PraticaRealizada {
  conteudoId: string;
  /** Data no formato AAAA-MM-DD. */
  dia: string;
  trilhaId?: string;
  ordemTrilha?: number;
}

export interface ContextoUsuario {
  perfil: PerfilUsuario;
  saude: SaudeUsuario;
  checkin: Checkin;
  /** Do mais recente para o mais antigo. */
  historico: PraticaRealizada[];
  /** Sintomas repetidos em check-ins seguidos (SEG-R03). */
  diasSeguidosComDor?: number;
}

// --- Saída ---

/** Por que um candidato foi excluído, com o ID da regra que o excluiu. */
export interface Exclusao {
  conteudoId: string;
  regra: string;
  motivo: string;
}

export interface PontuacaoPorCriterio {
  estado: number;
  objetivoPrincipal: number;
  objetivosSecundarios: number;
  perfil: number;
  ayurveda: number;
  preferencias: number;
  historico: number;
}

export interface ModificadorAplicado {
  regra: string;
  pontos: number;
  motivo: string;
}

export interface Candidato {
  conteudo: Conteudo;
  statusSeguranca: StatusSeguranca;
  criterios: PontuacaoPorCriterio;
  scoreBase: number;
  modificadores: ModificadorAplicado[];
  scoreFinal: number;
}

/** Tudo o que o motor levou em conta, para conferência humana (MOT-10). */
export interface Auditoria {
  versaoConfig: string;
  estadoFuncional: EstadoFuncional;
  modoConservador: boolean;
  totalNoCatalogo: number;
  candidatosConsiderados: number;
  exclusoes: Exclusao[];
  ranking: Candidato[];
  /** Sinal de alerta que interrompeu o fluxo (SEG-R04), se houver. */
  alerta?: string;
  /** Aviso de sintoma persistente (SEG-R03), se houver. */
  persistencia?: string;
}

export interface PraticaRecomendada {
  conteudo: Conteudo;
  scoreFinal: number;
  /** Texto para a pessoa, montado por template (MOT-09). */
  explicacao: string;
}

export interface ResultadoDia {
  /** `undefined` quando nada sobrou depois dos filtros. */
  principal?: PraticaRecomendada;
  /** Natureza diferente da principal (MOT-08). */
  alternativa?: PraticaRecomendada;
  estadoFuncional: EstadoFuncional;
  /** Mensagem de segurança que a pessoa precisa ler antes de praticar. */
  aviso?: string;
  auditoria: Auditoria;
}
