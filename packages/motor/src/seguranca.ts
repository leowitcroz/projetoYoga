import type { Conteudo, ContextoUsuario, Exclusao, StatusSeguranca } from '@life/shared';
import type { ChaveDeCarga, EngineConfig, RegraSeguranca } from './configuracao.js';

/**
 * Bloco 1 — Segurança (MOT-01, MOT-02, MOT-12).
 *
 * Esta é a primeira etapa do motor e a única que exclui sem apelação: o que
 * é bloqueado aqui não volta pelo score, por mais alto que ele seja
 * (SEG-R01). "Bloquear" quer dizer não recomendar automaticamente — a pessoa
 * continua podendo abrir o conteúdo na biblioteca (SEG-R02).
 */

export interface AvaliacaoDeSeguranca {
  status: StatusSeguranca;
  /** IDs das regras acionadas, para a auditoria. */
  regras: string[];
  motivos: string[];
}

const ORDEM: Record<StatusSeguranca, number> = {
  livre: 0,
  atencao: 1,
  adaptar: 2,
  bloquear: 3,
};

/** A dor de hoje vale para a regra? (SEG-R05: estado atual prevalece.) */
function dorAciona(contexto: ContextoUsuario, regra: RegraSeguranca): boolean {
  if (regra.gatilho.tipo !== 'dor') return false;

  const { dor, regiaoDaDor } = contexto.checkin;
  if (dor === 'nenhuma') return false;
  if (regra.gatilho.intensidadeMinima === 'forte' && dor !== 'forte') return false;

  return regiaoDaDor === regra.gatilho.regiao;
}

function condicaoAciona(contexto: ContextoUsuario, regra: RegraSeguranca): boolean {
  if (regra.gatilho.tipo !== 'condicao') return false;
  // Sem consentimento de saúde não há condições para consultar (MOT-12).
  if (!contexto.saude.consentida) return false;

  return contexto.saude.condicoes.includes(regra.gatilho.condicao);
}

/** O conteúdo tem a característica que a regra observa, no nível dela? */
function conteudoBate(conteudo: Conteudo, regra: RegraSeguranca): boolean {
  if (regra.campo === 'invertida') return conteudo.invertida === true;
  if (regra.campo === 'retencaoRespiratoria') return conteudo.retencaoRespiratoria === true;
  if (regra.campo === 'gestacaoNaoRevisada') return conteudo.revisadoParaGestacao !== true;

  const valor = conteudo[regra.campo as ChaveDeCarga] ?? 0;
  return valor >= regra.nivelGatilho;
}

/** Avalia um conteúdo contra todas as regras acionadas pelo contexto. */
export function avaliarSeguranca(
  conteudo: Conteudo,
  contexto: ContextoUsuario,
  config: EngineConfig,
): AvaliacaoDeSeguranca {
  const avaliacao: AvaliacaoDeSeguranca = { status: 'livre', regras: [], motivos: [] };

  for (const regra of config.seguranca) {
    if (!dorAciona(contexto, regra) && !condicaoAciona(contexto, regra)) continue;
    if (!conteudoBate(conteudo, regra)) continue;

    // "Adaptar" só se sustenta quando existe versão adaptada aprovada
    // (SEG-002). Sem ela, a regra vira bloqueio.
    let status = regra.status;
    if (status === 'adaptar' && conteudo.temVersaoAdaptada !== true) status = 'bloquear';

    avaliacao.regras.push(regra.id);
    avaliacao.motivos.push(regra.descricao);
    if (ORDEM[status] > ORDEM[avaliacao.status]) avaliacao.status = status;
  }

  return avaliacao;
}

export interface ResultadoDaSeguranca {
  seguros: { conteudo: Conteudo; status: StatusSeguranca }[];
  exclusoes: Exclusao[];
  modoConservador: boolean;
}

/**
 * Passa o catálogo inteiro pelo Bloco 1.
 *
 * Também aplica o modo conservador (MOT-12): sem consentimento de saúde o
 * motor não sabe o que a pessoa tem, então deixa de fora invertidas,
 * retenções e demanda física alta.
 */
export function filtrarPorSeguranca(
  catalogo: Conteudo[],
  contexto: ContextoUsuario,
  config: EngineConfig,
): ResultadoDaSeguranca {
  const modoConservador = !contexto.saude.consentida;
  const seguros: { conteudo: Conteudo; status: StatusSeguranca }[] = [];
  const exclusoes: Exclusao[] = [];

  for (const conteudo of catalogo) {
    // MOT-02: só conteúdo aprovado é candidato à recomendação automática.
    if (!conteudo.aprovado) {
      exclusoes.push({
        conteudoId: conteudo.id,
        regra: 'MOT-02',
        motivo: 'Conteúdo ainda não aprovado',
      });
      continue;
    }

    // Aula feita para um público específico não serve para quem está fora dele.
    if (conteudo.publicoEspecifico === 'gestacao' && !estaGestante(contexto)) {
      exclusoes.push({
        conteudoId: conteudo.id,
        regra: 'SEG-008',
        motivo: 'Conteúdo específico para gestação',
      });
      continue;
    }

    if (modoConservador) {
      const motivo = motivoConservador(conteudo, config);
      if (motivo) {
        exclusoes.push({ conteudoId: conteudo.id, regra: 'MOT-12', motivo });
        continue;
      }
    }

    const avaliacao = avaliarSeguranca(conteudo, contexto, config);
    if (avaliacao.status === 'bloquear') {
      exclusoes.push({
        conteudoId: conteudo.id,
        regra: avaliacao.regras.join(', '),
        motivo: avaliacao.motivos[0] ?? 'Bloqueado pelo filtro de segurança',
      });
      continue;
    }

    seguros.push({ conteudo, status: avaliacao.status });
  }

  return { seguros, exclusoes, modoConservador };
}

function estaGestante(contexto: ContextoUsuario): boolean {
  return contexto.saude.consentida && contexto.saude.condicoes.includes('gestacao');
}

function motivoConservador(conteudo: Conteudo, config: EngineConfig): string | null {
  if (conteudo.invertida) return 'Modo conservador: invertidas fora sem dados de saúde';
  if (conteudo.retencaoRespiratoria) {
    return 'Modo conservador: retenção respiratória fora sem dados de saúde';
  }
  if (conteudo.demandaFisica > config.demandaMaximaConservadora) {
    return 'Modo conservador: demanda física alta fora sem dados de saúde';
  }
  return null;
}

/**
 * SEG-R03 — sintoma repetido em vários check-ins seguidos.
 * Não bloqueia nada sozinho: acrescenta um aviso e segura a retomada de
 * conteúdos exigentes.
 */
export function avisoDePersistencia(
  contexto: ContextoUsuario,
  config: EngineConfig,
): string | undefined {
  const dias = contexto.diasSeguidosComDor ?? 0;
  if (dias < config.diasParaPersistencia) return undefined;

  return `Você vem relatando dor há ${dias} dias seguidos. Vale conversar com um profissional de saúde antes de aumentar a intensidade.`;
}
