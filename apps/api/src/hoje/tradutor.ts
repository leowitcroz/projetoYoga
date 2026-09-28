import type {
  Checkin,
  CondicaoDeSaude,
  Conteudo,
  ContextoUsuario,
  Modalidade,
  NivelExperiencia,
  Objetivo,
  PerfilDeEfeito,
  PraticaRealizada,
  RegiaoDaDor,
} from '@life/shared';

/**
 * Traduz o que está no banco para o que o motor entende.
 *
 * O motor é uma função pura que não conhece Prisma; esta é a única camada
 * que sabe das duas línguas. Toda conversão mora aqui, e não espalhada pelos
 * serviços.
 */

/** Linha da tabela Content, com os campos JSON já lidos. */
export interface LinhaDeConteudo {
  id: string;
  titulo: string;
  tipo: string;
  modalidade: string;
  duracaoMin: number;
  nivelTecnico: number;
  demandaFisica: number;
  area: string;
  aprovado: boolean;
  objetivos: unknown;
  caracteristicas: unknown;
  seguranca: unknown;
  ayurveda: unknown;
  trilhaId: string | null;
  ordemTrilha: number | null;
}

function comoObjeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === 'object' ? (valor as Record<string, unknown>) : {};
}

function numero(valor: unknown, padrao = 0): number {
  return typeof valor === 'number' ? valor : padrao;
}

export function paraConteudo(linha: LinhaDeConteudo): Conteudo {
  const seguranca = comoObjeto(linha.seguranca);
  const caracteristicas = comoObjeto(linha.caracteristicas);

  const efeito: PerfilDeEfeito = {
    intensidade: numero(caracteristicas.intensidade),
    mobilidade: numero(caracteristicas.mobilidade),
    respiracaoCalma: numero(caracteristicas.respiracaoCalma),
    yogaNidra: numero(caracteristicas.yogaNidra),
    relaxamento: numero(caracteristicas.relaxamento),
    ativacao: numero(caracteristicas.ativacao),
  };

  return {
    id: linha.id,
    titulo: linha.titulo,
    tipo: linha.tipo as Conteudo['tipo'],
    modalidade: linha.modalidade as Modalidade,
    duracaoMin: linha.duracaoMin,
    nivelTecnico: linha.nivelTecnico as Conteudo['nivelTecnico'],
    demandaFisica: linha.demandaFisica as Conteudo['demandaFisica'],
    area: linha.area as Conteudo['area'],
    aprovado: linha.aprovado,
    objetivos: comoObjeto(linha.objetivos) as Conteudo['objetivos'],
    caracteristicas: efeito,
    cargaCervical: seguranca.cargaCervical as Conteudo['cargaCervical'],
    cargaJoelho: seguranca.cargaJoelho as Conteudo['cargaJoelho'],
    cargaLombar: seguranca.cargaLombar as Conteudo['cargaLombar'],
    cargaOmbros: seguranca.cargaOmbros as Conteudo['cargaOmbros'],
    cargaPunhos: seguranca.cargaPunhos as Conteudo['cargaPunhos'],
    cargaQuadril: seguranca.cargaQuadril as Conteudo['cargaQuadril'],
    riscoQueda: seguranca.riscoQueda as Conteudo['riscoQueda'],
    demandaCardiovascular: seguranca.demandaCardiovascular as Conteudo['demandaCardiovascular'],
    mudancaRapidaPosicao: seguranca.mudancaRapidaPosicao as Conteudo['mudancaRapidaPosicao'],
    invertida: seguranca.invertida === true,
    retencaoRespiratoria: seguranca.retencaoRespiratoria === true,
    revisadoParaGestacao: seguranca.revisadoParaGestacao === true,
    temVersaoAdaptada: seguranca.temVersaoAdaptada === true,
    publicoEspecifico: seguranca.publicoEspecifico as Conteudo['publicoEspecifico'],
    ayurvedaTags: linha.ayurveda
      ? (comoObjeto(linha.ayurveda) as Conteudo['ayurvedaTags'])
      : undefined,
    trilhaId: linha.trilhaId ?? undefined,
    ordemTrilha: linha.ordemTrilha ?? undefined,
  };
}

/** Desmonta um `Conteudo` para gravar na tabela Content. */
export function paraLinha(conteudo: Conteudo) {
  return {
    id: conteudo.id,
    titulo: conteudo.titulo,
    tipo: conteudo.tipo,
    modalidade: conteudo.modalidade,
    duracaoMin: conteudo.duracaoMin,
    nivelTecnico: conteudo.nivelTecnico,
    demandaFisica: conteudo.demandaFisica,
    area: conteudo.area,
    aprovado: conteudo.aprovado,
    // O Prisma só aceita objetos "chatos" nos campos Json; as interfaces do
    // motor não servem como estão.
    objetivos: { ...conteudo.objetivos } as Record<string, number>,
    caracteristicas: { ...conteudo.caracteristicas } as Record<string, number>,
    seguranca: {
      cargaCervical: conteudo.cargaCervical ?? 0,
      cargaJoelho: conteudo.cargaJoelho ?? 0,
      cargaLombar: conteudo.cargaLombar ?? 0,
      cargaOmbros: conteudo.cargaOmbros ?? 0,
      cargaPunhos: conteudo.cargaPunhos ?? 0,
      cargaQuadril: conteudo.cargaQuadril ?? 0,
      riscoQueda: conteudo.riscoQueda ?? 0,
      demandaCardiovascular: conteudo.demandaCardiovascular ?? 0,
      mudancaRapidaPosicao: conteudo.mudancaRapidaPosicao ?? 0,
      invertida: conteudo.invertida === true,
      retencaoRespiratoria: conteudo.retencaoRespiratoria === true,
      revisadoParaGestacao: conteudo.revisadoParaGestacao === true,
      temVersaoAdaptada: conteudo.temVersaoAdaptada === true,
      publicoEspecifico: conteudo.publicoEspecifico ?? null,
    },
    ayurveda: conteudo.ayurvedaTags
      ? ({ ...conteudo.ayurvedaTags } as Record<string, number>)
      : undefined,
    trilhaId: conteudo.trilhaId ?? null,
    ordemTrilha: conteudo.ordemTrilha ?? null,
  };
}

export interface LinhaDeCheckin {
  sono: string;
  energia: string;
  corpo: string;
  dor: string;
  regiaoDaDor: string | null;
  estresse: string;
  digestao: string;
  humor: string;
  tempo: number;
}

export function paraCheckin(linha: LinhaDeCheckin): Checkin {
  return {
    sono: linha.sono as Checkin['sono'],
    energia: linha.energia as Checkin['energia'],
    corpo: linha.corpo as Checkin['corpo'],
    dor: linha.dor as Checkin['dor'],
    regiaoDaDor: (linha.regiaoDaDor ?? undefined) as RegiaoDaDor | undefined,
    estresse: linha.estresse as Checkin['estresse'],
    digestao: linha.digestao as Checkin['digestao'],
    humor: linha.humor as Checkin['humor'],
    tempo: linha.tempo,
  };
}

export interface DadosDoContexto {
  perfil: {
    objetivoPrincipal: string | null;
    objetivosSecundarios: string[];
    experiencia: unknown;
    constituicao: string | null;
    estadoAtual: string | null;
    estilos: string[];
  } | null;
  /** `null` quando não há consentimento de saúde: o motor vai conservador. */
  saude: { condicoes: string[] } | null;
  checkin: Checkin;
  historico: PraticaRealizada[];
  diasSeguidosComDor?: number;
}

/**
 * Monta o contexto que o motor recebe.
 *
 * As modalidades preferidas vêm dos "estilos" escolhidos no passo 5 do
 * cadastro, que a tela guarda com a primeira letra maiúscula.
 */
export function paraContexto(dados: DadosDoContexto): ContextoUsuario {
  const perfil = dados.perfil;
  const experiencia = comoObjeto(perfil?.experiencia);

  const porArea: ContextoUsuario['perfil']['experiencia'] = {};
  for (const [area, nivel] of Object.entries(experiencia)) {
    if (typeof nivel === 'string') {
      porArea[area as keyof typeof porArea] = traduzirNivel(nivel);
    }
  }

  return {
    perfil: {
      objetivoPrincipal: (perfil?.objetivoPrincipal ?? undefined) as Objetivo | undefined,
      objetivosSecundarios: (perfil?.objetivosSecundarios ?? []) as Objetivo[],
      experiencia: porArea,
      modalidadesPreferidas: (perfil?.estilos ?? [])
        .map((estilo) => estilo.toLowerCase().replace('yoga', '').trim())
        .filter((estilo): estilo is Modalidade => MODALIDADES.includes(estilo as Modalidade)),
      constituicao: (perfil?.constituicao ??
        undefined) as ContextoUsuario['perfil']['constituicao'],
      estadoAyurvedico: (perfil?.estadoAtual ??
        undefined) as ContextoUsuario['perfil']['estadoAyurvedico'],
    },
    saude: {
      consentida: dados.saude !== null,
      condicoes: (dados.saude?.condicoes ?? []) as CondicaoDeSaude[],
    },
    checkin: dados.checkin,
    historico: dados.historico,
    diasSeguidosComDor: dados.diasSeguidosComDor,
  };
}

const MODALIDADES: Modalidade[] = [
  'hatha',
  'vinyasa',
  'ashtanga',
  'restaurativo',
  'yin',
  'nidra',
  'pranayama',
  'meditacao',
  'mobilidade',
];

/**
 * O passo 2 do cadastro usa as palavras da tela; o motor usa a escala da
 * Matriz (PER-003).
 */
function traduzirNivel(valor: string): NivelExperiencia {
  if (valor === 'nunca') return 'nunca';
  if (valor === 'comecando' || valor === 'basico') return 'basico';
  if (valor === 'regular') return 'regular';
  if (valor === 'anos' || valor === 'professor' || valor === 'experiente') return 'experiente';
  return 'basico';
}
