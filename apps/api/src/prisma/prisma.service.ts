import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { PrismaClient as ClientePrisma } from '../generated/prisma/client.js';

// O construtor gerado pelo Prisma 7 é genérico e o TypeScript perde os tipos
// dos modelos ao estender a classe direto. Este cast devolve o tipo certo,
// para que `this.user`, `this.consent` e companhia continuem tipados.
const ClienteBase = PrismaClient as unknown as new (opcoes: { adapter: PrismaPg }) => ClientePrisma;

@Injectable()
export class PrismaService extends ClienteBase implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
