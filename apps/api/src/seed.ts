// Script solto: diferente da API, aqui ninguém carrega o .env por nós.
import 'dotenv/config';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { PrismaService } from './prisma/prisma.service.js';
import { paraLinha } from './hoje/tradutor.js';
import { CURSOS_DE_TESTE } from './aprender/cursos-de-teste.js';

/**
 * Popula o banco com o catálogo de teste da Fase 1 (F2.2).
 *
 * São práticas fictícias. O catálogo de verdade é cadastrado pelos professores
 * no painel (Fase 3), então em produção este script não roda por conta
 * própria: é preciso ligar `SEED_CATALOGO_DE_TESTE=1`, de propósito, para o
 * ambiente de demonstração ter o que mostrar.
 *
 * Roda a cada partida da API no Render, e por isso é idempotente: usa upsert e
 * não apaga nada que já esteja lá. Quando houver conteúdo de verdade, basta
 * apagar a variável.
 */
/**
 * Nomes das trilhas do catálogo de teste.
 *
 * Cada prática do catálogo guarda só o identificador da trilha a que pertence;
 * a trilha em si virou tabela no F3.6 e precisa existir antes das aulas, senão
 * a chave estrangeira recusa a gravação. Identificador sem nome aqui entra com
 * o próprio identificador como nome, para o professor renomear no painel.
 */
const NOMES_DAS_TRILHAS: Record<string, string> = {
  'TRILHA-MOB-01': 'Mobilidade da coluna',
};

/**
 * Estrutura fictícia para as práticas de teste (PRA-07).
 *
 * Numa prática de verdade quem divide os minutos é o professor, na ficha do
 * painel: ninguém consegue deduzir da duração quanto tempo de prāṇāyāma uma
 * aula tem. Aqui o catálogo inteiro é inventado, e esta divisão também é —
 * ela existe só para a tela do aluno ter o que mostrar em desenvolvimento.
 */
function estruturaDeTeste(
  modalidade: string,
  duracaoMin: number,
): { tipo: string; minutos: number }[] {
  // Modalidades de uma coisa só não têm divisão que faça sentido.
  const inteiras: Record<string, string> = {
    nidra: 'nidra',
    pranayama: 'pranayama',
    meditacao: 'meditacao',
  };
  const inteira = inteiras[modalidade];
  if (inteira) return [{ tipo: inteira, minutos: duracaoMin }];

  const preparacao = Math.max(2, Math.round(duracaoMin * 0.15));
  const relaxamento = Math.max(2, Math.round(duracaoMin * 0.15));
  const respiracao = duracaoMin >= 30 ? Math.max(2, Math.round(duracaoMin * 0.12)) : 0;
  const asanas = duracaoMin - preparacao - relaxamento - respiracao;

  // Sem minutos para o miolo, a prática é curta demais para dividir.
  if (asanas < 3) return [{ tipo: 'asanas', minutos: duracaoMin }];

  return [
    { tipo: 'preparacao', minutos: preparacao },
    { tipo: 'asanas', minutos: asanas },
    ...(respiracao > 0 ? [{ tipo: 'pranayama', minutos: respiracao }] : []),
    { tipo: 'relaxamento', minutos: relaxamento },
  ];
}

async function main(): Promise<void> {
  const ehProducao = process.env.NODE_ENV === 'production';
  const autorizado = process.env.SEED_CATALOGO_DE_TESTE === '1';

  if (ehProducao && !autorizado) {
    console.log('Seed ignorado: em produção ele só roda com SEED_CATALOGO_DE_TESTE=1.');
    return;
  }

  if (ehProducao) {
    console.warn('ATENÇÃO: gravando o catálogo FICTÍCIO de teste em produção.');
  }

  const prisma = new PrismaService();
  try {
    // As trilhas primeiro: as aulas apontam para elas.
    const aulasPorTrilha = new Map<string, number>();
    for (const conteudo of CATALOGO_DE_TESTE) {
      if (conteudo.trilhaId) {
        aulasPorTrilha.set(conteudo.trilhaId, (aulasPorTrilha.get(conteudo.trilhaId) ?? 0) + 1);
      }
    }

    for (const [id, totalAulas] of aulasPorTrilha) {
      const nome = NOMES_DAS_TRILHAS[id] ?? id;
      await prisma.track.upsert({
        where: { id },
        create: { id, nome, totalAulas },
        update: { nome, totalAulas },
      });
    }

    for (const conteudo of CATALOGO_DE_TESTE) {
      const linha = {
        ...paraLinha(conteudo),
        estrutura: estruturaDeTeste(conteudo.modalidade, conteudo.duracaoMin),
      };
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }
    // Cursos do Aprender (EDU-01). Mesma natureza: material de desenvolvimento.
    for (const curso of CURSOS_DE_TESTE) {
      const { aulas, ...dados } = curso;
      await prisma.course.upsert({
        where: { id: curso.id },
        create: { ...dados, status: 'APROVADO' },
        update: { ...dados, status: 'APROVADO' },
      });

      for (const [posicao, aula] of aulas.entries()) {
        const id = `${curso.id}-A${String(posicao + 1).padStart(2, '0')}`;
        const linha = { ...aula, cursoId: curso.id, ordem: posicao + 1 };
        await prisma.lesson.upsert({ where: { id }, create: { id, ...linha }, update: linha });
      }
    }

    const total = await prisma.content.count();
    const trilhas = await prisma.track.count();
    const cursos = await prisma.course.count();
    const aulas = await prisma.lesson.count();
    console.log(
      `Catálogo de teste no banco: ${total} conteúdos em ${trilhas} trilha(s), ` +
        `${cursos} curso(s) com ${aulas} aulas.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
