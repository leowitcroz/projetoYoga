import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { TokensService } from './../src/auth/tokens.service.js';

/**
 * Verificação de e-mail (AUTH-02) e redefinição de senha (AUTH-04).
 *
 * Os links chegam por e-mail, que o teste não lê; então pegamos o token pelo
 * próprio serviço, que é exatamente o que o e-mail carrega.
 */
describe('Segurança da conta (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokens: TokensService;

  const marca = Date.now();
  const email = `seguranca-${marca}@life.local`;
  const senhaAntiga = 'segredo123';
  const senhaNova = 'outraSenha456';
  let userId = '';

  const cadastro = {
    nome: 'Pessoa Segura',
    email,
    telefone: '(11) 91234-5678',
    senha: senhaAntiga,
    aceitePrivacidade: true,
  };

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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('AUTH-02: o cadastro nasce com o e-mail por confirmar', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/registro')
      .send(cadastro)
      .expect(201);

    expect(resposta.body.precisaVerificarEmail).toBe(true);

    const usuario = await prisma.user.findUnique({ where: { email } });
    userId = usuario?.id as string;
    expect(usuario?.emailVerificadoEm).toBeNull();
  });

  it('AUTH-02: guarda só o hash do link, nunca o link em si', async () => {
    const guardados = await prisma.authToken.findMany({ where: { userId } });

    expect(guardados.length).toBeGreaterThan(0);
    expect(guardados[0]?.tipo).toBe('VERIFICACAO_EMAIL');
    // 64 caracteres hexadecimais = sha256. Nada de token em texto puro.
    expect(guardados[0]?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('AUTH-02: sem confirmar o e-mail, não entra', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: senhaAntiga })
      .expect(403);

    expect(resposta.body.message).toMatch(/confirme o seu e-mail/i);
  });

  it('AUTH-02: link inválido não confirma nada', async () => {
    await request(app.getHttpServer())
      .post('/auth/verificar-email')
      .send({ token: 'este-token-nao-existe-mesmo' })
      .expect(400);
  });

  it('AUTH-02: o link certo confirma, e o login passa a funcionar', async () => {
    const token = await tokens.criar(userId, 'VERIFICACAO_EMAIL');

    await request(app.getHttpServer())
      .post('/auth/verificar-email')
      .send({ token })
      .expect(200, { verificado: true });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: senhaAntiga })
      .expect(200);
  });

  it('AUTH-02: o mesmo link não serve duas vezes', async () => {
    const token = await tokens.criar(userId, 'VERIFICACAO_EMAIL');

    await request(app.getHttpServer()).post('/auth/verificar-email').send({ token }).expect(200);
    await request(app.getHttpServer()).post('/auth/verificar-email').send({ token }).expect(400);
  });

  it('AUTH-02: pedir um link novo invalida o anterior', async () => {
    const primeiro = await tokens.criar(userId, 'VERIFICACAO_EMAIL');
    await tokens.criar(userId, 'VERIFICACAO_EMAIL');

    await request(app.getHttpServer())
      .post('/auth/verificar-email')
      .send({ token: primeiro })
      .expect(400);
  });

  it('AUTH-04: "esqueci minha senha" responde igual para quem existe e quem não existe', async () => {
    await request(app.getHttpServer()).post('/auth/esqueci-senha').send({ email }).expect(202);

    await request(app.getHttpServer())
      .post('/auth/esqueci-senha')
      .send({ email: `ninguem-${marca}@life.local` })
      .expect(202);
  });

  it('AUTH-04: o link troca a senha; a antiga deixa de valer', async () => {
    const token = await tokens.criar(userId, 'REDEFINICAO_SENHA');

    await request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ token, senha: senhaNova })
      .expect(200, { redefinida: true });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: senhaAntiga })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: senhaNova })
      .expect(200);
  });

  it('AUTH-04: trocar a senha derruba as sessões abertas', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: senhaNova })
      .expect(200);
    const refreshToken = login.body.refreshToken as string;

    const token = await tokens.criar(userId, 'REDEFINICAO_SENHA');
    await request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ token, senha: senhaAntiga })
      .expect(200);

    // Quem estava logado com a senha antiga perde o acesso.
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('AUTH-04: recusa senha curta na redefinição', async () => {
    const token = await tokens.criar(userId, 'REDEFINICAO_SENHA');

    await request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ token, senha: 'curta' })
      .expect(400);
  });

  it('AUTH-04: um link de verificação não serve para trocar senha', async () => {
    const token = await tokens.criar(userId, 'VERIFICACAO_EMAIL');

    await request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ token, senha: senhaNova })
      .expect(400);
  });

  it('o link vencido não vale', async () => {
    const token = await tokens.criar(userId, 'REDEFINICAO_SENHA');
    await prisma.authToken.updateMany({
      where: { userId, tipo: 'REDEFINICAO_SENHA', usadoEm: null },
      data: { expiraEm: new Date(Date.now() - 1000) },
    });

    await request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ token, senha: senhaNova })
      .expect(400);
  });
});
