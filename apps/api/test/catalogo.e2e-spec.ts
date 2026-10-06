import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { paraLinha } from './../src/hoje/tradutor.js';
import { criarContaVerificada } from './conta-de-teste.js';

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

    const conta = await criarContaVerificada(app, { nome: 'Curioso de Teste', email });
    token = conta.accessToken;
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

  it('a lista traz capa e professor, para a tela não ficar sem imagem', async () => {
    const resposta = await pedir('/catalogo?duracaoMax=20').expect(200);
    const aula = resposta.body[0];

    // capaUrl pode vir vazia — aí o app desenha a capa pela modalidade.
    expect(aula).toHaveProperty('capaUrl');
    expect(aula.professor).toBeTruthy();
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

  describe('biblioteca do Praticar (PRA-01)', () => {
    it('conta quantas aulas há em cada área e objetivo', async () => {
      const resposta = await pedir('/catalogo/biblioteca').expect(200);

      expect(resposta.body.total).toBeGreaterThan(10);
      expect(resposta.body.areas.asanas).toBeGreaterThan(0);
      expect(Object.keys(resposta.body.objetivos).length).toBeGreaterThan(3);
    });

    it('a contagem não inclui o que não foi aprovado', async () => {
      const resposta = await pedir('/catalogo/biblioteca').expect(200);
      const aprovadas = await prisma.content.count({ where: { status: 'APROVADO' } });

      expect(resposta.body.total).toBe(aprovadas);
    });

    it('filtra por área', async () => {
      const resposta = await pedir('/catalogo?area=pranayama').expect(200);

      expect(resposta.body.length).toBeGreaterThan(0);
      for (const aula of resposta.body) {
        const gravada = await prisma.content.findUnique({
          where: { id: aula.id as string },
          select: { area: true },
        });
        expect(gravada?.area).toBe('pranayama');
      }
    });

    it('aceita relaxamento como área, que faltava na lista', async () => {
      // Antes isto dava 400: o PRA-01 lista a área, mas ela não existia no
      // filtro nem na ficha, então a biblioteca teria uma porta sem nada atrás.
      await pedir('/catalogo?area=relaxamento').expect(200);
    });

    it('recusa área inventada', async () => {
      await pedir('/catalogo?area=cafezinho').expect(400);
    });
  });

  describe('"Para você" (PRA-01)', () => {
    it('usa o objetivo que a pessoa declarou no cadastro', async () => {
      const conta = await criarContaVerificada(app, {
        nome: 'Quem quer dormir',
        email: `paravoce-sono-${Date.now()}@life.local`,
        onboarding: { objetivoPrincipal: 'sono', objetivosSecundarios: ['estresse'] },
      });

      const resposta = await request(app.getHttpServer())
        .get('/catalogo/para-voce')
        .set('Authorization', `Bearer ${conta.accessToken}`)
        .expect(200);

      expect(resposta.body.objetivo).toBe('sono');
      expect(resposta.body.aulas.length).toBeGreaterThan(0);

      // Toda aula oferecida tem de servir a algum objetivo declarado: um
      // "para você" com aula que não atende nada seria só uma lista qualquer.
      for (const aula of resposta.body.aulas) {
        const gravada = await prisma.content.findUnique({
          where: { id: aula.id as string },
          select: { objetivos: true },
        });
        const objetivos = gravada?.objetivos as Record<string, number>;
        expect((objetivos.sono ?? 0) + (objetivos.estresse ?? 0)).toBeGreaterThan(0);
      }

      await prisma.user.delete({ where: { id: conta.id } });
    });

    it('o objetivo principal pesa mais que o secundário', async () => {
      const conta = await criarContaVerificada(app, {
        nome: 'Quem quer força',
        email: `paravoce-forca-${Date.now()}@life.local`,
        onboarding: { objetivoPrincipal: 'forca', objetivosSecundarios: ['sono'] },
      });

      const resposta = await request(app.getHttpServer())
        .get('/catalogo/para-voce')
        .set('Authorization', `Bearer ${conta.accessToken}`)
        .expect(200);

      const primeira = await prisma.content.findUnique({
        where: { id: resposta.body.aulas[0].id as string },
        select: { objetivos: true },
      });
      const objetivos = primeira?.objetivos as Record<string, number>;
      expect(objetivos.forca ?? 0).toBeGreaterThan(0);

      await prisma.user.delete({ where: { id: conta.id } });
    });

    it('sem perfil preenchido não inventa uma lista "para você"', async () => {
      const resposta = await pedir('/catalogo/para-voce').expect(200);

      expect(resposta.body.objetivo).toBeNull();
      expect(resposta.body.aulas).toEqual([]);
    });
  });
});
