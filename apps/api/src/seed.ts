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
    for (const conteudo of CATALOGO_DE_TESTE) {
      const linha = paraLinha(conteudo);
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }
    const total = await prisma.content.count();
    console.log(`Catálogo de teste no banco: ${total} conteúdos.`);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
