import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { paraLinha } from './../src/hoje/tradutor.js';

/**
 * Caminho completo: cadastro → check-in → recomendação.
 * É o teste que prova que o motor está mesmo ligado na API.
 */
describe('Prática de hoje (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const marca = Date.now();
  const email = `hoje-${marca}@life.local`;
  const senha = 'segredo123';
  const hoje = '2026-09-28';
  let token = '';
  // O mesmo dia pode ter check-in de outras contas no banco de desenvolvimento:
  // toda consulta deste teste precisa filtrar por usuário.
  let userId = '';

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);

    // O catálogo precisa existir no banco para o motor ter o que escolher.
    for (const conteudo of CATALOGO_DE_TESTE) {
      const linha = paraLinha(conteudo);
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }

    const cadastro = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nome: 'Ana de Teste',
        email,
        telefone: '(11) 91234-5678',
        senha,
        aceitePrivacidade: true,
        aceiteSaude: true,
        onboarding: {
          objetivoPrincipal: 'estresse',
          objetivosSecundarios: ['sono'],
          experiencia: { asanas: 'comecando', pranayama: 'comecando', nidra: 'comecando' },
          estilos: ['Hatha'],
          passoConcluido: 5,
        },
        saude: { condicoes: [] },
      })
      .expect(201);

    token = cadastro.body.accessToken as string;
    userId = cadastro.body.usuario.id as string;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('HOME-01: sem check-in, a Home não recomenda', async () => {
    await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('guarda o check-in do dia (CHK-01)', async () => {
    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dia: hoje,
        sono: 'ruim',
        energia: 'baixa',
        corpo: 'cansado',
        dor: 'nenhuma',
        estresse: 'alto',
        digestao: 'normal',
        humor: 'oscilando',
        tempo: 20,
      })
      .expect(200);

    const salvo = await prisma.dailyCheckin.findFirst({ where: { userId, dia: hoje } });
    expect(salvo?.sono).toBe('ruim');
  });

  it('MOT-08: devolve principal e alternativa dentro do tempo', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.principal).toBeDefined();
    expect(resposta.body.principal.conteudo.duracaoMin).toBeLessThanOrEqual(20);
    expect(resposta.body.principal.explicacao.length).toBeGreaterThan(10);
    expect(resposta.body.alternativa?.conteudo.modalidade).not.toBe(
      resposta.body.principal.conteudo.modalidade,
    );
    expect(['recuperacao', 'tensao', 'desaceleracao', 'disponibilidade']).toContain(
      resposta.body.estadoFuncional,
    );
  });

  it('MOT-10: a recomendação fica registrada com auditoria', async () => {
    const registro = await prisma.recommendation.findFirst({
      where: { userId, dia: hoje },
      orderBy: { criadoEm: 'desc' },
    });

    expect(registro?.versaoConfig).toBe('v1');
    expect(registro?.principalId).toBeTruthy();
    const auditoria = registro?.auditoria as { ranking?: unknown[]; exclusoes?: unknown[] };
    expect(Array.isArray(auditoria.ranking)).toBe(true);
    expect(Array.isArray(auditoria.exclusoes)).toBe(true);
  });

  it('CHK-04: refazer o check-in muda a recomendação', async () => {
    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dia: hoje,
        sono: 'bom',
        energia: 'alta',
        corpo: 'disposto',
        dor: 'nenhuma',
        estresse: 'tranquilo',
        digestao: 'normal',
        humor: 'equilibrado',
        tempo: 45,
      })
      .expect(200);

    const resposta = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Com 45 minutos disponíveis, práticas mais longas passam a caber.
    expect(resposta.body.principal.conteudo.duracaoMin).toBeLessThanOrEqual(45);
    expect(resposta.body.estadoFuncional).not.toBe('recuperacao');
  });

  it('SEG-R05: dor no pescoço tira a carga cervical da recomendação', async () => {
    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dia: hoje,
        sono: 'bom',
        energia: 'alta',
        corpo: 'disposto',
        dor: 'forte',
        regiaoDaDor: 'cervical',
        estresse: 'tranquilo',
        digestao: 'normal',
        humor: 'equilibrado',
        tempo: 60,
      })
      .expect(200);

    const resposta = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.aviso).toMatch(/dor/i);

    const registro = await prisma.recommendation.findFirst({
      where: { userId, dia: hoje },
      orderBy: { criadoEm: 'desc' },
    });
    const auditoria = registro?.auditoria as { ranking: { conteudo: { id: string } }[] };
    const ids = auditoria.ranking.map((item) => item.conteudo.id);

    expect(ids).not.toContain('PRAT-025'); // invertidas guiadas, carga cervical 3
  });

  it('refazer o check-in não penaliza a aula recomendada minutos antes', async () => {
    const checkin = {
      dia: hoje,
      sono: 'razoavel',
      energia: 'media',
      corpo: 'normal',
      dor: 'nenhuma',
      estresse: 'tranquilo',
      digestao: 'normal',
      humor: 'equilibrado',
      tempo: 20,
    };

    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${token}`)
      .send(checkin)
      .expect(200);

    const primeira = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Mesmas respostas, pedidas de novo: o resultado tem de ser o mesmo.
    const segunda = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(segunda.body.principal.conteudo.id).toBe(primeira.body.principal.conteudo.id);
    expect(segunda.body.principal.scoreFinal).toBe(primeira.body.principal.scoreFinal);
  });

  it('MOT-03: a prática cabe na janela do tempo escolhido', async () => {
    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dia: hoje,
        sono: 'razoavel',
        energia: 'media',
        corpo: 'normal',
        dor: 'nenhuma',
        estresse: 'tranquilo',
        digestao: 'normal',
        humor: 'equilibrado',
        tempo: 30,
      })
      .expect(200);

    const resposta = await request(app.getHttpServer())
      .get(`/hoje?dia=${hoje}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.principal.conteudo.duracaoMin).toBeGreaterThanOrEqual(25);
    expect(resposta.body.principal.conteudo.duracaoMin).toBeLessThanOrEqual(35);
  });

  it('não devolve recomendação para quem não está logado', async () => {
    await request(app.getHttpServer()).get(`/hoje?dia=${hoje}`).expect(401);
    await request(app.getHttpServer()).put('/checkin').send({ dia: hoje }).expect(401);
  });
});
