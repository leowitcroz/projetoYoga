import type { Conteudo, Modalidade, PerfilDeEfeito } from '@life/shared';

/**
 * Catálogo fictício para os testes (F1.5).
 *
 * Não é conteúdo real: serve para exercitar o motor com práticas de várias
 * modalidades, durações, níveis e cargas. O catálogo de verdade entra na
 * Fase 3, cadastrado pelos professores.
 */

function efeito(parcial: Partial<PerfilDeEfeito>): PerfilDeEfeito {
  return {
    intensidade: 0,
    mobilidade: 0,
    respiracaoCalma: 0,
    yogaNidra: 0,
    relaxamento: 0,
    ativacao: 0,
    ...parcial,
  };
}

interface Atalho {
  id: string;
  titulo: string;
  modalidade: Modalidade;
  duracaoMin: number;
  nivelTecnico: 1 | 2 | 3 | 4 | 5;
  demandaFisica: 1 | 2 | 3 | 4 | 5;
  area: Conteudo['area'];
  objetivos: Conteudo['objetivos'];
  caracteristicas: Partial<PerfilDeEfeito>;
  extras?: Partial<Conteudo>;
}

function pratica(atalho: Atalho): Conteudo {
  const { caracteristicas, extras, ...resto } = atalho;
  return {
    tipo: 'pratica',
    aprovado: true,
    caracteristicas: efeito(caracteristicas),
    ...resto,
    ...extras,
  };
}

export const CATALOGO_DE_TESTE: Conteudo[] = [
  // --- Práticas suaves e de recuperação ---
  pratica({
    id: 'PRAT-001',
    titulo: 'Yoga Nidra para descansar',
    modalidade: 'nidra',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 1,
    area: 'nidra',
    objetivos: { sono: 5, estresse: 4 },
    caracteristicas: { yogaNidra: 5, relaxamento: 5, respiracaoCalma: 3, intensidade: 1 },
    extras: { ayurvedaTags: { vata: 3 } },
  }),
  pratica({
    id: 'PRAT-002',
    titulo: 'Yoga Nidra curto',
    modalidade: 'nidra',
    duracaoMin: 10,
    nivelTecnico: 1,
    demandaFisica: 1,
    area: 'nidra',
    objetivos: { sono: 4, estresse: 3 },
    caracteristicas: { yogaNidra: 5, relaxamento: 4, respiracaoCalma: 3, intensidade: 1 },
  }),
  pratica({
    id: 'PRAT-003',
    titulo: 'Respiração calma guiada',
    modalidade: 'pranayama',
    duracaoMin: 10,
    nivelTecnico: 1,
    demandaFisica: 1,
    area: 'pranayama',
    objetivos: { estresse: 5, respiracao: 5, sono: 3 },
    caracteristicas: { respiracaoCalma: 5, relaxamento: 4, intensidade: 1 },
    extras: { ayurvedaTags: { vata: 3, pitta: 2 } },
  }),
  pratica({
    id: 'PRAT-004',
    titulo: 'Pranayama com retenções',
    modalidade: 'pranayama',
    duracaoMin: 20,
    nivelTecnico: 4,
    demandaFisica: 2,
    area: 'pranayama',
    objetivos: { respiracao: 5, meditacao: 3 },
    caracteristicas: { respiracaoCalma: 4, intensidade: 2 },
    extras: { retencaoRespiratoria: true },
  }),
  pratica({
    id: 'PRAT-005',
    titulo: 'Hatha suave para o fim do dia',
    modalidade: 'hatha',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { estresse: 5, sono: 4, mobilidade: 3 },
    caracteristicas: { respiracaoCalma: 4, relaxamento: 4, mobilidade: 3, intensidade: 2 },
    extras: { ayurvedaTags: { vata: 3, pitta: 2 } },
  }),
  pratica({
    id: 'PRAT-006',
    titulo: 'Restaurativo com apoios',
    modalidade: 'restaurativo',
    duracaoMin: 30,
    nivelTecnico: 1,
    demandaFisica: 1,
    area: 'asanas',
    objetivos: { estresse: 5, sono: 4 },
    caracteristicas: { relaxamento: 5, respiracaoCalma: 4, intensidade: 1 },
  }),
  pratica({
    id: 'PRAT-007',
    titulo: 'Yin Yoga para quadris',
    modalidade: 'yin',
    duracaoMin: 45,
    nivelTecnico: 2,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { flexibilidade: 5, mobilidade: 4, estresse: 3 },
    caracteristicas: { mobilidade: 4, relaxamento: 4, respiracaoCalma: 3, intensidade: 2 },
    extras: { cargaQuadril: 3 },
  }),
  pratica({
    id: 'PRAT-008',
    titulo: 'Meditação guiada de atenção',
    modalidade: 'meditacao',
    duracaoMin: 15,
    nivelTecnico: 1,
    demandaFisica: 1,
    area: 'meditacao',
    objetivos: { meditacao: 5, estresse: 4 },
    caracteristicas: { respiracaoCalma: 4, relaxamento: 4, intensidade: 1 },
  }),

  // --- Mobilidade ---
  pratica({
    id: 'PRAT-010',
    titulo: 'Mobilidade da coluna',
    modalidade: 'mobilidade',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { mobilidade: 5, flexibilidade: 3 },
    caracteristicas: { mobilidade: 5, intensidade: 2, ativacao: 2 },
    extras: { trilhaId: 'TRILHA-MOB-01', ordemTrilha: 1 },
  }),
  pratica({
    id: 'PRAT-011',
    titulo: 'Mobilidade da coluna — aula 2',
    modalidade: 'mobilidade',
    duracaoMin: 25,
    nivelTecnico: 2,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { mobilidade: 5, flexibilidade: 3 },
    caracteristicas: { mobilidade: 5, intensidade: 2, ativacao: 2 },
    extras: { trilhaId: 'TRILHA-MOB-01', ordemTrilha: 2 },
  }),
  pratica({
    id: 'PRAT-012',
    titulo: 'Mobilidade de ombros e pescoço',
    modalidade: 'mobilidade',
    duracaoMin: 15,
    nivelTecnico: 1,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { mobilidade: 5 },
    caracteristicas: { mobilidade: 5, intensidade: 2 },
    extras: { cargaCervical: 2, cargaOmbros: 2, temVersaoAdaptada: true },
  }),
  pratica({
    id: 'PRAT-013',
    titulo: 'Abertura de quadris e lombar',
    modalidade: 'mobilidade',
    duracaoMin: 30,
    nivelTecnico: 2,
    demandaFisica: 3,
    area: 'asanas',
    objetivos: { mobilidade: 5, flexibilidade: 4 },
    caracteristicas: { mobilidade: 5, intensidade: 3 },
    extras: { cargaLombar: 3, cargaQuadril: 3 },
  }),

  // --- Hatha e Vinyasa de intensidade média e alta ---
  pratica({
    id: 'PRAT-020',
    titulo: 'Hatha clássico',
    modalidade: 'hatha',
    duracaoMin: 45,
    nivelTecnico: 2,
    demandaFisica: 3,
    area: 'asanas',
    objetivos: { pratica: 4, mobilidade: 3, forca: 3 },
    caracteristicas: { intensidade: 3, mobilidade: 3, ativacao: 3 },
    extras: { ayurvedaTags: { kapha: 3 } },
  }),
  pratica({
    id: 'PRAT-021',
    titulo: 'Vinyasa matinal',
    modalidade: 'vinyasa',
    duracaoMin: 30,
    nivelTecnico: 3,
    demandaFisica: 4,
    area: 'asanas',
    objetivos: { disposicao: 5, forca: 4 },
    caracteristicas: { intensidade: 4, ativacao: 5, mobilidade: 3 },
    extras: { demandaCardiovascular: 3, mudancaRapidaPosicao: 2, ayurvedaTags: { kapha: 3 } },
  }),
  pratica({
    id: 'PRAT-022',
    titulo: 'Vinyasa vigoroso',
    modalidade: 'vinyasa',
    duracaoMin: 60,
    nivelTecnico: 4,
    demandaFisica: 5,
    area: 'asanas',
    objetivos: { forca: 5, disposicao: 4 },
    caracteristicas: { intensidade: 5, ativacao: 5 },
    extras: {
      demandaCardiovascular: 3,
      mudancaRapidaPosicao: 3,
      cargaPunhos: 3,
      cargaOmbros: 3,
      riscoQueda: 2,
    },
  }),
  pratica({
    id: 'PRAT-023',
    titulo: 'Ashtanga primeira série',
    modalidade: 'ashtanga',
    duracaoMin: 60,
    nivelTecnico: 5,
    demandaFisica: 5,
    area: 'asanas',
    objetivos: { forca: 5, pratica: 5 },
    caracteristicas: { intensidade: 5, ativacao: 5 },
    extras: { demandaCardiovascular: 3, cargaPunhos: 3, invertida: true },
  }),
  pratica({
    id: 'PRAT-024',
    titulo: 'Força e estabilidade',
    modalidade: 'hatha',
    duracaoMin: 30,
    nivelTecnico: 2,
    demandaFisica: 4,
    area: 'asanas',
    objetivos: { forca: 5, disposicao: 3 },
    caracteristicas: { intensidade: 4, ativacao: 4 },
    extras: { cargaJoelho: 3, cargaPunhos: 2 },
  }),
  pratica({
    id: 'PRAT-025',
    titulo: 'Invertidas guiadas',
    modalidade: 'hatha',
    duracaoMin: 30,
    nivelTecnico: 4,
    demandaFisica: 4,
    area: 'asanas',
    objetivos: { forca: 4, pratica: 5 },
    caracteristicas: { intensidade: 4, ativacao: 4 },
    extras: { invertida: true, cargaCervical: 3, cargaOmbros: 3, riscoQueda: 3 },
  }),
  pratica({
    id: 'PRAT-026',
    titulo: 'Equilíbrio em pé',
    modalidade: 'hatha',
    duracaoMin: 20,
    nivelTecnico: 2,
    demandaFisica: 3,
    area: 'asanas',
    objetivos: { forca: 3, mobilidade: 3 },
    caracteristicas: { intensidade: 3, ativacao: 3 },
    extras: { riscoQueda: 3 },
  }),
  pratica({
    id: 'PRAT-027',
    titulo: 'Saudações ao sol para gestantes',
    modalidade: 'hatha',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { disposicao: 4, mobilidade: 3 },
    caracteristicas: { intensidade: 2, ativacao: 3, mobilidade: 3 },
    extras: { revisadoParaGestacao: true, publicoEspecifico: 'gestacao' },
  }),
  pratica({
    id: 'PRAT-028',
    titulo: 'Prática dinâmica sem carga cervical',
    modalidade: 'vinyasa',
    duracaoMin: 30,
    nivelTecnico: 3,
    demandaFisica: 4,
    area: 'asanas',
    objetivos: { forca: 4, disposicao: 4 },
    caracteristicas: { intensidade: 4, ativacao: 4, mobilidade: 2 },
    extras: { cargaCervical: 0, demandaCardiovascular: 2 },
  }),

  // --- Conteúdo que não deve aparecer ---
  pratica({
    id: 'PRAT-090',
    titulo: 'Aula em revisão editorial',
    modalidade: 'hatha',
    duracaoMin: 20,
    nivelTecnico: 1,
    demandaFisica: 2,
    area: 'asanas',
    objetivos: { mobilidade: 5, estresse: 5, sono: 5 },
    caracteristicas: { mobilidade: 5, relaxamento: 5, respiracaoCalma: 5 },
    extras: { aprovado: false },
  }),
];
