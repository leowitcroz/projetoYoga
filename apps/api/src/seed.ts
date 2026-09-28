// Script solto: diferente da API, aqui ninguém carrega o .env por nós.
import 'dotenv/config';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { PrismaService } from './prisma/prisma.service.js';
import { paraLinha } from './hoje/tradutor.js';

/**
 * Popula o banco com o catálogo de teste da Fase 1 (F2.2).
 *
 * São práticas fictícias, só para desenvolvimento: o catálogo de verdade é
 * cadastrado pelos professores no painel (Fase 3). Por isso o seed recusa
 * rodar em produção.
 */
async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('O seed é de desenvolvimento e não roda em produção');
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
