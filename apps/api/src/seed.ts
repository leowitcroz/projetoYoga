// Script solto: diferente da API, aqui ninguém carrega o .env por nós.
import 'dotenv/config';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { PrismaService } from './prisma/prisma.service.js';
import { paraLinha } from './hoje/tradutor.js';

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
      const linha = paraLinha(conteudo);
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }
    const total = await prisma.content.count();
    const trilhas = await prisma.track.count();
    console.log(`Catálogo de teste no banco: ${total} conteúdos em ${trilhas} trilha(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
