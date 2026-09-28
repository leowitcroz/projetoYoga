import type { Conteudo, ContextoUsuario, ModificadorAplicado, StatusSeguranca } from '@life/shared';
import type { EngineConfig } from './configuracao.js';

/**
 * Etapa 5 — modificadores (MOT-07).
 *
 * Ajustes que vêm depois do score base: continuidade da trilha, cansaço de
 * repetição e o freio de quem está em "atenção" pela segurança.
 */

function diasAtras(dia: string, hoje: Date): number {
  const [ano, mes, data] = dia.split('-').map(Number);
  if (!ano || !mes || !data) return Number.POSITIVE_INFINITY;

  const meiaNoiteDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const outroDia = new Date(ano, mes - 1, data);
  return Math.round((meiaNoiteDeHoje.getTime() - outroDia.getTime()) / 86400000);
}

/** A próxima aula da trilha que a pessoa está fazendo (PER-008). */
function ehProximaDaTrilha(conteudo: Conteudo, contexto: ContextoUsuario): boolean {
  if (conteudo.trilhaId === undefined || conteudo.ordemTrilha === undefined) return false;

  const ultima = contexto.historico
    .filter((item) => item.trilhaId === conteudo.trilhaId && item.ordemTrilha !== undefined)
    .sort((a, b) => (b.ordemTrilha ?? 0) - (a.ordemTrilha ?? 0))[0];

  if (!ultima) return conteudo.ordemTrilha === 1;
  return conteudo.ordemTrilha === (ultima.ordemTrilha ?? 0) + 1;
}

export function aplicarModificadores(
  conteudo: Conteudo,
  status: StatusSeguranca,
  contexto: ContextoUsuario,
  config: EngineConfig,
  agora: Date,
): ModificadorAplicado[] {
  const aplicados: ModificadorAplicado[] = [];
  const { modificadores } = config;

  if (ehProximaDaTrilha(conteudo, contexto)) {
    aplicados.push({
      regra: 'PER-008',
      pontos: modificadores.continuidade,
      motivo: 'É a próxima aula da sua trilha',
    });
  }

  const feitoEm = contexto.historico
    .filter((item) => item.conteudoId === conteudo.id)
    .map((item) => diasAtras(item.dia, agora));
  const maisRecente = feitoEm.length > 0 ? Math.min(...feitoEm) : Number.POSITIVE_INFINITY;

  if (maisRecente <= 1) {
    aplicados.push({
      regra: 'MOD-repeticao-ontem',
      pontos: modificadores.repeticaoOntem,
      motivo: 'Você praticou isto ontem',
    });
  } else if (maisRecente <= 3) {
    aplicados.push({
      regra: 'MOD-repeticao-3-dias',
      pontos: modificadores.repeticaoTresDias,
      motivo: 'Você praticou isto nos últimos dias',
    });
  }

  // Segurança em "atenção" não bloqueia, mas segura a prioridade (SEG-007).
  if (status === 'atencao') {
    aplicados.push({
      regra: 'SEG-007',
      pontos: -10,
      motivo: 'Exige atenção com o que você relatou hoje',
    });
  }

  if (status === 'adaptar') {
    aplicados.push({
      regra: 'SEG-002',
      pontos: -5,
      motivo: 'Entra na versão adaptada',
    });
  }

  return aplicados;
}

/**
 * Descoberta (MOT-07): reserva uma fatia das sugestões secundárias para
 * conteúdo que a pessoa ainda não praticou, para o app não virar uma bolha.
 *
 * A semente vem de fora para o motor continuar determinístico: mesma entrada,
 * mesma saída.
 */
export function escolherDescoberta(
  ordenados: { conteudo: Conteudo }[],
  contexto: ContextoUsuario,
  config: EngineConfig,
  semente: number,
): Conteudo | undefined {
  const novos = ordenados.filter(
    (item) => !contexto.historico.some((feito) => feito.conteudoId === item.conteudo.id),
  );
  if (novos.length === 0) return undefined;

  // A semente decide se hoje é um dia de descoberta.
  const sorteio = (semente % 100) / 100;
  if (sorteio >= config.modificadores.fatiaDeDescoberta) return undefined;

  return novos[semente % novos.length]?.conteudo;
}
