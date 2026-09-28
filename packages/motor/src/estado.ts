import type { Checkin, EstadoFuncional, PerfilDeEfeito } from '@life/shared';
import type { EngineConfig } from './configuracao.js';

/**
 * Bloco 2 — Estado do dia (MOT-05).
 *
 * O check-in vira duas coisas: um **perfil de efeito** (o quanto o dia pede
 * de cada dimensão) e um **estado funcional** (a palavra que resume o dia e
 * aparece na explicação).
 */

export type Periodo = 'manha' | 'tarde' | 'noite';

export function periodoDoDia(agora: Date): Periodo {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return 'manha';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noite';
}

/**
 * Quais regras do Bloco 2 este check-in aciona.
 *
 * A Matriz 1.1 usa escala de 1 a 5 e o check-in do app tem três opções por
 * pergunta. A tradução fica aqui, explícita, porque é uma decisão de produto
 * que ainda precisa da confirmação do Marcos:
 *
 * - sono ruim / razoável / bom  → EST-001 (1–2) / EST-002 (3) / EST-003 (4–5)
 * - energia baixa / média / alta → EST-004 (1–2) / nada / EST-005 (4–5)
 * - estresse alto               → EST-006 (4–5)
 * - corpo cansado               → EST-008 ("muito cansado")
 * - digestão pesada             → EST-009
 * - humor abatido               → EST-012 (regra nova, fora da Matriz 1.1)
 *
 * "Corpo rígido" (EST-007) não tem correspondente no check-in atual: a
 * pergunta de corpo só oferece cansado, normal e disposto.
 */
export function regrasAcionadas(checkin: Checkin, periodo: Periodo): string[] {
  const ids: string[] = [];

  if (checkin.sono === 'ruim') ids.push('EST-001');
  if (checkin.sono === 'razoavel') ids.push('EST-002');
  if (checkin.sono === 'bom') ids.push('EST-003');

  if (checkin.energia === 'baixa') ids.push('EST-004');
  if (checkin.energia === 'alta') ids.push('EST-005');

  if (checkin.estresse === 'alto') ids.push('EST-006');
  if (checkin.corpo === 'cansado') ids.push('EST-008');
  if (checkin.digestao === 'pesada') ids.push('EST-009');
  if (checkin.humor === 'abatido') ids.push('EST-012');

  if (periodo === 'noite') ids.push('EST-010');
  if (periodo === 'manha') ids.push('EST-011');

  return ids;
}

const ZERADO: PerfilDeEfeito = {
  intensidade: 0,
  mobilidade: 0,
  respiracaoCalma: 0,
  yogaNidra: 0,
  relaxamento: 0,
  ativacao: 0,
};

/** Soma os efeitos de todas as regras acionadas. */
export function perfilDoDia(
  checkin: Checkin,
  periodo: Periodo,
  config: EngineConfig,
): { perfil: PerfilDeEfeito; regras: string[] } {
  const regras = regrasAcionadas(checkin, periodo);
  const perfil: PerfilDeEfeito = { ...ZERADO };

  for (const id of regras) {
    const regra = config.estado.find((item) => item.id === id);
    if (!regra) continue;

    for (const [dimensao, valor] of Object.entries(regra.efeito)) {
      perfil[dimensao as keyof PerfilDeEfeito] += valor;
    }
  }

  return { perfil, regras };
}

/**
 * O nome do dia (Documento Mestre, seção 5).
 *
 * A ordem importa: primeiro o que pede cuidado (recuperação), depois o que
 * pede calma (tensão, desaceleração) e só então o que libera intensidade.
 */
export function estadoFuncional(
  checkin: Checkin,
  perfil: PerfilDeEfeito,
  periodo: Periodo,
): EstadoFuncional {
  const corpoPedeDescanso =
    checkin.corpo === 'cansado' || checkin.energia === 'baixa' || checkin.sono === 'ruim';

  if (corpoPedeDescanso && perfil.intensidade <= -3) return 'recuperacao';
  if (checkin.estresse === 'alto' || checkin.humor === 'abatido') return 'tensao';
  if (periodo === 'noite' && perfil.ativacao < 0) return 'desaceleracao';
  if (perfil.ativacao >= 2 && checkin.energia === 'alta') return 'ativacao';
  if (corpoPedeDescanso) return 'recuperacao';

  return 'disponibilidade';
}

/** Frase curta do estado, usada na explicação (MOT-09). */
export const NOME_DO_ESTADO: Record<EstadoFuncional, string> = {
  recuperacao: 'um dia de recuperação',
  tensao: 'um dia de tensão',
  ativacao: 'um dia de ativação',
  disponibilidade: 'um dia de disponibilidade',
  desaceleracao: 'um fim de dia para desacelerar',
};
