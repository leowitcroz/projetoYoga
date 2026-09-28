/**
 * Motor LIFE — decide a prática do dia a partir do check-in.
 *
 * Função pura: não conhece banco, HTTP nem tela, e o relógio vem por
 * parâmetro. Implementa o fluxo da aba 08 da Matriz Técnica 1.1.
 */
export { recomendarDia, type OpcoesDoMotor } from './recomendar.js';
export {
  CONFIG_V1,
  type EngineConfig,
  type Modificadores,
  type PesosDoRanking,
  type RegraEstado,
  type RegraSeguranca,
} from './configuracao.js';
export { avaliarSeguranca, filtrarPorSeguranca, avisoDePersistencia } from './seguranca.js';
export { estadoFuncional, perfilDoDia, periodoDoDia, regrasAcionadas } from './estado.js';
export { filtrarPorTempoENivel, tetoTecnico } from './filtros.js';
export { calcularScoreBase, notaDoEstado } from './score.js';
export { aplicarModificadores, escolherDescoberta } from './modificadores.js';
export { explicar, avisoDeDor } from './explicacao.js';
export { CATALOGO_DE_TESTE } from './catalogo-de-teste.js';
