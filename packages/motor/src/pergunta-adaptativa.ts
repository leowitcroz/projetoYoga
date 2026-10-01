import type { Candidato, ContextoUsuario, PerguntaPendente } from '@life/shared';

/**
 * MOT-18 / CTX-001 — perguntar só quando a resposta muda a decisão.
 *
 * A regra da Matriz é explícita: "não perguntar quando não altera decisão".
 * Um check-in que cresce a cada dia cansa, e cansaço vira resposta no
 * automático — que é pior do que não perguntar.
 *
 * Por isso a pergunta sobre refeição recente só aparece quando **a prática
 * que ganhou pede estômago vazio** e existe uma alternativa aceitável sem
 * essa exigência. Se a melhor escolha fosse a mesma dos dois jeitos, o motor
 * cala a boca e recomenda.
 */

/** O quanto a alternativa pode ser pior e ainda assim valer a pergunta. */
const MARGEM = 10;

export function perguntaSobreRefeicao(
  ranking: Candidato[],
  contexto: ContextoUsuario,
): PerguntaPendente | undefined {
  // Já respondeu hoje: não se pergunta duas vezes.
  if (contexto.checkin.refeicaoRecente !== undefined) return undefined;

  const principal = ranking[0];
  if (!principal?.conteudo.sensivelAposRefeicao) return undefined;

  // Sem outra opção razoável, saber da refeição não muda nada: ou é esta
  // prática, ou nenhuma.
  const alternativa = ranking.find((item) => !item.conteudo.sensivelAposRefeicao);
  if (!alternativa) return undefined;
  if (principal.scoreFinal - alternativa.scoreFinal > MARGEM) return undefined;

  return {
    id: 'refeicao-recente',
    pergunta: 'Você fez uma refeição principal nas últimas duas horas?',
    explicacao:
      'A prática de hoje tem posturas que pedem o estômago mais leve. Se você comeu há pouco, escolho outra.',
    opcoes: [
      { valor: true, rotulo: 'Sim, comi há pouco' },
      { valor: false, rotulo: 'Não, faz mais tempo' },
    ],
  };
}

/**
 * Quem comeu há pouco não recebe prática que pede estômago vazio.
 *
 * Não é um bloqueio de segurança — é conforto, e por isso vale só para a
 * recomendação automática: na biblioteca a prática continua lá.
 */
export function adiarSensiveisAposRefeicao(
  ranking: Candidato[],
  contexto: ContextoUsuario,
): Candidato[] {
  if (contexto.checkin.refeicaoRecente !== true) return ranking;
  return ranking.filter((item) => !item.conteudo.sensivelAposRefeicao);
}
