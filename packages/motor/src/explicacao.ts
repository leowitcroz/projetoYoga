import type { Candidato, ContextoUsuario, EstadoFuncional } from '@life/shared';
import { NOME_DO_ESTADO } from './estado.js';

/**
 * MOT-09 — "por que esta prática?".
 *
 * Monta o texto a partir dos critérios que mais pesaram, seguindo as regras de
 * linguagem da seção 9 do plano: frase curta, sem promessa de resultado, sem
 * explicação causal que o motor não pode sustentar.
 */

const NOME_DO_OBJETIVO: Record<string, string> = {
  mobilidade: 'mobilidade',
  flexibilidade: 'flexibilidade',
  forca: 'força',
  estresse: 'reduzir o estresse',
  sono: 'dormir melhor',
  respiracao: 'respiração',
  meditacao: 'meditação',
  disposicao: 'disposição',
  ayurveda: 'Ayurveda',
  filosofia: 'filosofia',
  pratica: 'aprofundar a prática',
  formacao: 'formação',
};

export function explicar(
  candidato: Candidato,
  contexto: ContextoUsuario,
  estado: EstadoFuncional,
): string {
  const partes: string[] = [`Hoje parece ${NOME_DO_ESTADO[estado]}.`];

  const objetivo = contexto.perfil.objetivoPrincipal;
  const pesoDoObjetivo = candidato.criterios.objetivoPrincipal;
  if (objetivo && pesoDoObjetivo >= 15) {
    partes.push(
      `Esta prática caminha com o seu objetivo de ${NOME_DO_OBJETIVO[objetivo] ?? objetivo}.`,
    );
  }

  const continuidade = candidato.modificadores.find((item) => item.regra === 'PER-008');
  if (continuidade) partes.push('É a próxima aula da sua trilha.');

  if (candidato.statusSeguranca === 'adaptar') {
    partes.push('Ela entra na versão adaptada, por causa do que você contou hoje.');
  }
  if (candidato.statusSeguranca === 'atencao') {
    partes.push('Vá com calma e pare se algo incomodar.');
  }

  partes.push(`São ${candidato.conteudo.duracaoMin} minutos.`);

  return partes.join(' ');
}

/** Aviso que a pessoa lê antes de praticar, quando a dor apareceu hoje. */
export function avisoDeDor(contexto: ContextoUsuario): string | undefined {
  const { dor } = contexto.checkin;
  if (dor === 'nenhuma') return undefined;

  if (dor === 'forte') {
    return 'Você relatou dor forte. A prática de hoje vem mais suave, e vale procurar um profissional de saúde para avaliar.';
  }
  return 'Você relatou dor. Tirei do caminho o que costuma exigir mais dessa região; respeite o que o corpo pedir.';
}
