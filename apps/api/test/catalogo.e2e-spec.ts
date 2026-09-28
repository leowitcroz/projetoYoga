import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { paraLinha } from './../src/hoje/tradutor.js';

describe('Catálogo (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const email = `catalogo-${Date.now()}@life.local`;
  let token = '';

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    for (const conteudo of CATALOGO_DE_TESTE) {
      const linha = paraLinha(conteudo);
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }

    const cadastro = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nome: 'Curioso de Teste',
        email,
        telefone: '(11) 91234-5678',
        senha: 'segredo123',
        aceitePrivacidade: true,
      })
      .expect(201);

    token = cadastro.body.accessToken as string;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  function pedir(caminho: string) {
    return request(app.getHttpServer()).get(caminho).set('Authorization', `Bearer ${token}`);
  }

  it('lista só o conteúdo aprovado (MOT-02)', async () => {
    const resposta = await pedir('/catalogo').expect(200);
    const ids = resposta.body.map((aula: { id: string }) => aula.id);

    expect(ids.length).toBeGreaterThan(10);
    expect(ids).not.toContain('PRAT-090'); // aula em revisão editorial
  });

  it('filtra por duração máxima', async () => {
    const resposta = await pedir('/catalogo?duracaoMax=20').expect(200);

    expect(resposta.body.length).toBeGreaterThan(0);
    for (const aula of resposta.body) {
      expect(aula.duracaoMin).toBeLessThanOrEqual(20);
    }
  });

  it('filtra por modalidade', async () => {
    const resposta = await pedir('/catalogo?modalidade=nidra').expect(200);

    expect(resposta.body.length).toBeGreaterThan(0);
    for (const aula of resposta.body) {
      expect(aula.modalidade).toBe('nidra');
    }
  });

  it('filtra por objetivo', async () => {
    const resposta = await pedir('/catalogo?objetivo=sono').expect(200);

    expect(resposta.body.length).toBeGreaterThan(0);
    for (const aula of resposta.body) {
      expect(aula.objetivos.sono).toBeGreaterThan(0);
    }
  });

  it('recusa filtro inválido em vez de ignorar', async () => {
    await pedir('/catalogo?modalidade=capoeira').expect(400);
    await pedir('/catalogo?duracaoMax=nao-e-numero').expect(400);
  });

  it('devolve a ficha de uma aula', async () => {
    const resposta = await pedir('/catalogo/PRAT-001').expect(200);

    expect(resposta.body.titulo).toBe('Yoga Nidra para descansar');
    expect(resposta.body.duracaoMin).toBe(20);
  });

  it('SEG-R02: a biblioteca mostra o que o motor não recomendaria hoje', async () => {
    // PRAT-023 tem invertida e nível 5: raramente é recomendado, mas existe.
    const resposta = await pedir('/catalogo/PRAT-023').expect(200);
    expect(resposta.body.id).toBe('PRAT-023');
  });

  it('não devolve aula que não foi aprovada', async () => {
    await pedir('/catalogo/PRAT-090').expect(404);
    await pedir('/catalogo/NAO-EXISTE').expect(404);
  });

  it('exige login', async () => {
    await request(app.getHttpServer()).get('/catalogo').expect(401);
  });
});
