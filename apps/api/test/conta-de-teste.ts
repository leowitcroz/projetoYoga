import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

/**
 * Cria uma conta já com o e-mail confirmado e devolve a sessão.
 *
 * Desde o AUTH-02, o cadastro não abre sessão: a pessoa precisa clicar no link
 * que chega por e-mail. Nos testes que não são sobre isso, pular essa etapa
 * mantém o teste falando do assunto dele.
 */
export interface ContaDeTeste {
  id: string;
  email: string;
  senha: string;
  accessToken: string;
  refreshToken: string;
}

export async function criarContaVerificada(
  app: INestApplication<App>,
  dados: {
    nome: string;
    email: string;
    senha?: string;
    onboarding?: Record<string, unknown>;
    saude?: Record<string, unknown>;
    aceiteSaude?: boolean;
  },
): Promise<ContaDeTeste> {
  const senha = dados.senha ?? 'segredo123';
  const prisma = app.get(PrismaService);

  await request(app.getHttpServer())
    .post('/auth/registro')
    .send({
      nome: dados.nome,
      email: dados.email,
      telefone: '(11) 91234-5678',
      senha,
      aceitePrivacidade: true,
      ...(dados.aceiteSaude === undefined ? {} : { aceiteSaude: dados.aceiteSaude }),
      ...(dados.onboarding ? { onboarding: dados.onboarding } : {}),
      ...(dados.saude ? { saude: dados.saude } : {}),
    })
    .expect(201);

  // O mesmo efeito de clicar no link do e-mail.
  const usuario = await prisma.user.update({
    where: { email: dados.email.toLowerCase() },
    data: { emailVerificadoEm: new Date() },
    select: { id: true },
  });

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: dados.email, senha })
    .expect(200);

  return {
    id: usuario.id,
    email: dados.email,
    senha,
    accessToken: login.body.accessToken as string,
    refreshToken: login.body.refreshToken as string,
  };
}
