import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CATALOGO_DE_TESTE } from '@life/motor';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { TokensService } from './../src/auth/tokens.service.js';
import { paraLinha } from './../src/hoje/tradutor.js';

/**
 * F2.19 — a jornada inteira, do jeito que uma pessoa faz:
 * cadastro → confirmação do e-mail → onboarding → check-in → prática do dia
 * → conclusão → feedback.
 *
 * Também cobre F2.20 (dor reaplica a segurança) e F2.21 (saúde fora dos logs).
 */
describe('Jornada completa (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokens: TokensService;

  const marca = Date.now();
  const email = `jornada-${marca}@life.local`;
  const senha = 'segredo123';
  /**
   * As datas são relativas ao dia de hoje, de propósito.
   *
   * Com datas fixas, o teste da repetição (MOT-07) passou a falhar sozinho
   * quando o calendário andou: o motor conta há quantos dias a prática foi
   * feita a partir do relógio, e uma "ontem" escrita em 2026-10-01 vira
   * "cinco dias atrás" assim que a semana passa.
   */
  function diaRelativo(deslocamento: number): string {
    const data = new Date();
    data.setDate(data.getDate() + deslocamento);
    return data.toISOString().slice(0, 10);
  }

  const hoje = diaRelativo(0);
  let token = '';
  let userId = '';
  let praticaDoDia = '';

  function autenticado(metodo: 'get' | 'put' | 'post', caminho: string) {
    return request(app.getHttpServer())[metodo](caminho).set('Authorization', `Bearer ${token}`);
  }

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
    tokens = app.get(TokensService);

    for (const conteudo of CATALOGO_DE_TESTE) {
      const linha = paraLinha(conteudo);
      await prisma.content.upsert({ where: { id: linha.id }, create: linha, update: linha });
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('1. cadastra com as respostas do onboarding', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nome: 'Júlia da Jornada',
        email,
        telefone: '(11) 91234-5678',
        senha,
        aceitePrivacidade: true,
        aceiteSaude: true,
        onboarding: {
          objetivoPrincipal: 'estresse',
          objetivosSecundarios: ['sono'],
          experiencia: { asanas: 'comecando', nidra: 'comecando', pranayama: 'comecando' },
          estilos: ['Hatha'],
          passoConcluido: 5,
        },
        saude: { condicoes: ['ansiedade'] },
      })
      .expect(201);

    expect(resposta.body.precisaVerificarEmail).toBe(true);

    const usuario = await prisma.user.findUnique({ where: { email } });
    userId = usuario?.id as string;
  });

  it('2. confirma o e-mail e entra', async () => {
    const link = await tokens.criar(userId, 'VERIFICACAO_EMAIL');
    await request(app.getHttpServer())
      .post('/auth/verificar-email')
      .send({ token: link })
      .expect(200);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha })
      .expect(200);

    token = login.body.accessToken as string;
  });

  it('3. as respostas do cadastro estão guardadas', async () => {
    const perfil = await autenticado('get', '/onboarding').expect(200);

    expect(perfil.body.objetivoPrincipal).toBe('estresse');
    expect(perfil.body.passoConcluido).toBe(5);
  });

  it('4. faz o check-in do dia', async () => {
    await autenticado('put', '/checkin')
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
  });

  it('5. recebe a prática do dia, com explicação', async () => {
    const resposta = await autenticado('get', `/hoje?dia=${hoje}`).expect(200);

    praticaDoDia = resposta.body.principal.conteudo.id as string;
    expect(praticaDoDia).toBeTruthy();
    expect(resposta.body.principal.conteudo.duracaoMin).toBeLessThanOrEqual(20);
    expect(resposta.body.principal.explicacao.length).toBeGreaterThan(10);
  });

  it('6. começa e conclui a prática (F2.18)', async () => {
    await autenticado('post', `/praticas/${praticaDoDia}/eventos`)
      .send({ dia: hoje, tipo: 'INICIADA' })
      .expect(201);

    await autenticado('post', `/praticas/${praticaDoDia}/eventos`)
      .send({ dia: hoje, tipo: 'CONCLUIDA' })
      .expect(201);

    const eventos = await prisma.practiceEvent.count({ where: { userId, dia: hoje } });
    expect(eventos).toBe(2);
  });

  it('7. avalia a prática depois de concluída', async () => {
    const resposta = await autenticado('post', `/praticas/${praticaDoDia}/feedback`)
      .send({ dia: hoje, gostou: true, intensidadePercebida: 'na-medida' })
      .expect(201);

    expect(resposta.body.gostou).toBe(true);
    expect(resposta.body.intensidadePercebida).toBe('na-medida');
  });

  it('não dá para avaliar o que não foi concluído', async () => {
    await autenticado('post', '/praticas/PRAT-022/feedback')
      .send({ dia: hoje, gostou: true })
      .expect(400);
  });

  it('MOT-07: no dia seguinte, a prática concluída conta como repetição', async () => {
    const amanha = diaRelativo(1);
    await autenticado('put', '/checkin')
      .send({
        dia: amanha,
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

    const resposta = await autenticado('get', `/hoje?dia=${amanha}`).expect(200);
    const candidato = resposta.body.auditoria.ranking.find(
      (item: { conteudo: { id: string } }) => item.conteudo.id === praticaDoDia,
    );

    expect(candidato.modificadores.map((m: { regra: string }) => m.regra)).toContain(
      'MOD-repeticao-ontem',
    );
  });

  it('F2.20: check-in com dor reaplica a segurança (CHK-03, SEG-R05)', async () => {
    const dia = diaRelativo(2);
    await autenticado('put', '/checkin')
      .send({
        dia,
        sono: 'bom',
        energia: 'alta',
        corpo: 'disposto',
        dor: 'forte',
        regiaoDaDor: 'joelhos',
        estresse: 'tranquilo',
        digestao: 'normal',
        humor: 'equilibrado',
        tempo: 45,
      })
      .expect(200);

    const resposta = await autenticado('get', `/hoje?dia=${dia}`).expect(200);

    expect(resposta.body.aviso).toMatch(/dor/i);

    // PRAT-024 tem carga elevada no joelho: sai do ranking automático.
    const ids = resposta.body.auditoria.ranking.map(
      (item: { conteudo: { id: string } }) => item.conteudo.id,
    );
    expect(ids).not.toContain('PRAT-024');

    const exclusao = resposta.body.auditoria.exclusoes.find(
      (item: { conteudoId: string }) => item.conteudoId === 'PRAT-024',
    );
    expect(exclusao.regra).toContain('SEG-009');
  });

  it('F2.21: nenhum dado de saúde aparece no registro de acesso', async () => {
    await new Promise((resolva) => setTimeout(resolva, 300));

    const registros = await prisma.accessLog.findMany({ where: { userId } });
    const texto = JSON.stringify(registros);

    expect(registros.length).toBeGreaterThan(0);
    for (const sensivel of ['joelhos', 'ansiedade', 'oscilando', 'cansado', 'forte']) {
      expect(texto).not.toContain(sensivel);
    }
  });

  it('F2.21: a recomendação guardada não vaza saúde para fora do motor', async () => {
    const registro = await prisma.recommendation.findFirst({
      where: { userId },
      orderBy: { criadoEm: 'desc' },
    });

    // A auditoria guarda a decisão, não as respostas de saúde da pessoa.
    const texto = JSON.stringify(registro?.auditoria);
    expect(texto).not.toContain('ansiedade');
  });
});
