/**
 * Dados de saúde não podem aparecer em log (PRIV-02).
 *
 * Em vez de confiar em quem chama o logger, tiramos os campos sensíveis
 * de qualquer objeto antes de ele virar texto. Também escondemos senha e
 * token, que não são saúde mas nunca devem ser gravados.
 */
const CAMPOS_ESCONDIDOS = [
  'condicoes',
  'saude',
  'healthProfile',
  'observacoes',
  'gestacao',
  'dor',
  'senha',
  'senhaHash',
  'token',
  'refreshToken',
  'accessToken',
];

const ESCONDIDO = '[escondido]';

export function limparParaLog(valor: unknown, profundidade = 0): unknown {
  if (profundidade > 8) return ESCONDIDO;
  if (Array.isArray(valor)) {
    return valor.map((item) => limparParaLog(item, profundidade + 1));
  }
  if (valor === null || typeof valor !== 'object') return valor;

  const saida: Record<string, unknown> = {};
  for (const [chave, conteudo] of Object.entries(valor as Record<string, unknown>)) {
    saida[chave] = CAMPOS_ESCONDIDOS.includes(chave)
      ? ESCONDIDO
      : limparParaLog(conteudo, profundidade + 1);
  }
  return saida;
}
