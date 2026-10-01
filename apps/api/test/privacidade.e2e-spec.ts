import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { PrivacidadeService } from './../src/privacidade/privacidade.service.js';
import { criarContaVerificada } from './conta-de-teste.js';

/**
 * Privacidade: registro de acesso (PRIV-03) e exclusão de conta (AUTH-07).
 */
describe('Privacidade (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let privacidade: PrivacidadeService;

  const marca = Date.now();
  const email = `privacidade-${marca}@life.local`;
  let conta: Awaited<ReturnType<typeof criarContaVerificada>>;

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
    privacidade = app.get(PrivacidadeService);

    conta = await criarContaVerificada(app, {
      nome: 'Pessoa Privada',
      email,
      aceiteSaude: true,
      saude: { condicoes: ['ansiedade', 'hipertensao'] },
      onboarding: { objetivoPrincipal: 'sono', passoConcluido: 5 },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('PRIV-03: o acesso fica registrado com rota, método e quem chamou', async () => {
    await request(app.getHttpServer())
      .get('/auth/eu')
      .set('Authorization', `Bearer ${conta.accessToken}`)
      .expect(200);

    // O registro é gravado sem segurar a resposta; esperamos um instante.
    await new Promise((resolva) => setTimeout(resolva, 300));

    const registro = await prisma.accessLog.findFirst({
      where: { userId: conta.id, rota: '/auth/eu' },
      orderBy: { criadoEm: 'desc' },
    });

    expect(registro).toBeTruthy();
    expect(registro?.metodo).toBe('GET');
  });

  it('PRIV-02: o registro guarda só rota e método, nunca o conteúdo', async () => {
    await request(app.getHttpServer())
      .put('/checkin')
      .set('Authorization', `Bearer ${conta.accessToken}`)
      .send({
        dia: '2026-10-01',
        sono: 'ruim',
        energia: 'baixa',
        corpo: 'cansado',
        dor: 'forte',
        regiaoDaDor: 'lombar',
        estresse: 'alto',
        digestao: 'pesada',
        humor: 'abatido',
        tempo: 20,
      })
      .expect(200);

    await new Promise((resolva) => setTimeout(resolva, 300));

    const registros = await prisma.accessLog.findMany({ where: { userId: conta.id } });
    const texto = JSON.stringify(registros);

    // Nada do que a pessoa respondeu pode estar aqui.
    for (const sensivel of ['lombar', 'abatido', 'ansiedade', 'hipertensao']) {
      expect(texto).not.toContain(sensivel);
    }
  });

  it('PRIV-03: o /health não enche a tabela', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    await new Promise((resolva) => setTimeout(resolva, 200));

    const doHealth = await prisma.accessLog.count({ where: { rota: '/health' } });
    expect(doHealth).toBe(0);
  });

  it('PRIV-03: registro com mais de 6 meses é apagado', async () => {
    const antigo = new Date();
    antigo.setMonth(antigo.getMonth() - 7);

    await prisma.accessLog.create({
      data: { userId: conta.id, rota: '/teste-antigo', metodo: 'GET', criadoEm: antigo },
    });

    await privacidade.apagarRegistrosVencidos();

    const sobrou = await prisma.accessLog.count({ where: { rota: '/teste-antigo' } });
    expect(sobrou).toBe(0);

    // E o que é recente continua lá.
    const recentes = await prisma.accessLog.count({ where: { userId: conta.id } });
    expect(recentes).toBeGreaterThan(0);
  });

  it('AUTH-07: excluir a conta apaga a pessoa e tudo o que é dela', async () => {
    await request(app.getHttpServer())
      .delete('/auth/conta')
      .set('Authorization', `Bearer ${conta.accessToken}`)
      .expect(204);

    expect(await prisma.user.findUnique({ where: { id: conta.id } })).toBeNull();
    expect(await prisma.healthProfile.findUnique({ where: { userId: conta.id } })).toBeNull();
    expect(await prisma.onboardingProfile.findUnique({ where: { userId: conta.id } })).toBeNull();
    expect(await prisma.dailyCheckin.count({ where: { userId: conta.id } })).toBe(0);
    expect(await prisma.consent.count({ where: { userId: conta.id } })).toBe(0);
    expect(await prisma.refreshToken.count({ where: { userId: conta.id } })).toBe(0);
  });

  it('AUTH-07: o registro de acesso fica, mas sem dono', async () => {
    const comDono = await prisma.accessLog.count({ where: { userId: conta.id } });
    expect(comDono).toBe(0);

    // As linhas continuam existindo — é o que a lei manda guardar.
    const semDono = await prisma.accessLog.count({ where: { userId: null } });
    expect(semDono).toBeGreaterThan(0);
  });

  it('AUTH-07: depois de excluída, a conta não entra mais', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: conta.senha })
      .expect(401);

    await request(app.getHttpServer())
      .get('/auth/eu')
      .set('Authorization', `Bearer ${conta.accessToken}`)
      .expect(401);
  });

  it('AUTH-07: ninguém exclui conta sem estar logado', async () => {
    await request(app.getHttpServer()).delete('/auth/conta').expect(401);
  });
});
