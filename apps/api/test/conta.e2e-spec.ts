import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

/**
 * Caminho completo da conta: cadastro com as respostas do onboarding,
 * login, sessão e as regras de privacidade dos dados de saúde.
 */
describe('Conta e onboarding (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // E-mail novo a cada execução, para o teste não brigar com o banco local.
  const marca = Date.now();
  const email = `teste-${marca}@life.local`;
  const emailSemSaude = `teste-${marca}-b@life.local`;
  const senha = 'segredo123';

  const cadastro = {
    nome: 'Júlia de Teste',
    email,
    telefone: '(11) 91234-5678',
    senha,
    aceitePrivacidade: true,
    aceiteSaude: true,
    onboarding: {
      objetivoPrincipal: 'sono',
      objetivosSecundarios: ['estresse'],
      experiencia: { geral: 'comecando' },
      constituicao: 'vata',
      estilos: ['Hatha'],
      temas: ['Meditação'],
      horarioPreferido: 'manha',
      passoConcluido: 5,
    },
    saude: { condicoes: ['ansiedade'] },
  };

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [email, emailSemSaude] } } });
    await app.close();
  });

  it('cadastra e já devolve a sessão (AUTH-01)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/registro')
      .send(cadastro)
      .expect(201);

    expect(resposta.body.accessToken).toBeTruthy();
    expect(resposta.body.refreshToken).toBeTruthy();
    expect(resposta.body.usuario.nome).toBe('Júlia de Teste');
    // A resposta do cadastro nunca devolve a senha nem os dados de saúde.
    expect(JSON.stringify(resposta.body)).not.toContain('segredo123');
    expect(JSON.stringify(resposta.body)).not.toContain('ansiedade');
  });

  it('recusa e-mail repetido', async () => {
    await request(app.getHttpServer()).post('/auth/registro').send(cadastro).expect(409);
  });

  it('recusa cadastro sem aceitar a política (PRIV-01)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({ ...cadastro, email: emailSemSaude, aceitePrivacidade: false })
      .expect(400);
  });

  it('guarda a senha só como hash', async () => {
    const usuario = await prisma.user.findUnique({ where: { email } });

    expect(usuario?.senhaHash).toBeTruthy();
    expect(usuario?.senhaHash).not.toContain(senha);
    expect(usuario?.senhaHash.startsWith('$argon2')).toBe(true);
  });

  it('entra com e-mail e senha e recusa senha errada (AUTH-03)', async () => {
    const certo = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha })
      .expect(200);
    expect(certo.body.accessToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: 'outra-senha' })
      .expect(401);
  });

  it('responde igual para e-mail que não existe', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `nao-existe-${marca}@life.local`, senha })
      .expect(401);

    expect(resposta.body.message).toBe('E-mail ou senha incorretos');
  });

  it('devolve as respostas do onboarding para quem está logado', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email, senha });
    const token = login.body.accessToken as string;

    const perfil = await request(app.getHttpServer())
      .get('/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(perfil.body.objetivoPrincipal).toBe('sono');
    expect(perfil.body.horarioPreferido).toBe('manha');
    // Mesmo com consentimento, saúde não vem junto do perfil.
    expect(JSON.stringify(perfil.body)).not.toContain('ansiedade');
  });

  it('não deixa entrar sem token', async () => {
    await request(app.getHttpServer()).get('/onboarding').expect(401);
    await request(app.getHttpServer())
      .get('/onboarding')
      .set('Authorization', 'Bearer token-inventado')
      .expect(401);
  });

  it('troca o refresh por uma sessão nova e invalida o antigo', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email, senha });
    const refreshToken = login.body.refreshToken as string;

    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(200);
    // O mesmo refresh não serve duas vezes.
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('logout derruba a sessão daquele aparelho', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email, senha });
    const refreshToken = login.body.refreshToken as string;

    await request(app.getHttpServer()).post('/auth/logout').send({ refreshToken }).expect(204);
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('só aceita dados de saúde com consentimento de saúde (ONB-03)', async () => {
    const semSaude = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        ...cadastro,
        email: emailSemSaude,
        aceiteSaude: false,
        saude: { condicoes: ['gestacao'] },
      })
      .expect(201);

    const token = semSaude.body.accessToken as string;
    await request(app.getHttpServer())
      .put('/onboarding/saude')
      .set('Authorization', `Bearer ${token}`)
      .send({ condicoes: ['gestacao'] })
      .expect(403);

    // E o que veio no cadastro sem consentimento também não foi gravado.
    const usuario = await prisma.user.findUnique({
      where: { email: emailSemSaude },
      include: { saude: true },
    });
    expect(usuario?.saude).toBeNull();
  });
});
