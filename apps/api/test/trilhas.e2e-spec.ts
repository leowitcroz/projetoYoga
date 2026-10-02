import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { criarContaVerificada } from './conta-de-teste.js';

/**
 * Trilhas: práticas percorridas em ordem (ADM-05, F3.6).
 *
 * O que estes testes protegem é a sequência. Enquanto a posição era digitada
 * na ficha de cada prática, dava para ter duas aulas na posição 3 e nenhuma
 * na 4 — e o motor, que procura a próxima somando 1 (PER-008), parava de
 * achar a continuação sem que ninguém percebesse.
 */
describe('Trilhas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const marca = Date.now();
  const contas = {
    professor: `trilha-prof-${marca}@life.local`,
    outroProfessor: `trilha-prof2-${marca}@life.local`,
    master: `trilha-master-${marca}@life.local`,
  };
  const tokens: Record<string, string> = {};
  const praticas: string[] = [];
  let trilhaId = '';

  const fichaValida = {
    titulo: 'Aula de trilha',
    modalidade: 'mobilidade',
    area: 'asanas',
    duracaoMin: 20,
    nivelTecnico: 2,
    demandaFisica: 2,
    objetivos: { mobilidade: 5 },
    caracteristicas: {
      intensidade: 2,
      mobilidade: 5,
      respiracaoCalma: 2,
      yogaNidra: 0,
      relaxamento: 2,
      ativacao: 2,
    },
    seguranca: {
      cargaCervical: 0,
      cargaJoelho: 0,
      cargaLombar: 1,
      cargaOmbros: 0,
      cargaPunhos: 0,
      cargaQuadril: 0,
      riscoQueda: 0,
      demandaCardiovascular: 1,
      mudancaRapidaPosicao: 0,
      invertida: false,
      retencaoRespiratoria: false,
    },
  };

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);

    for (const [papel, email] of Object.entries(contas)) {
      const conta = await criarContaVerificada(app, { nome: `Pessoa ${papel}`, email });
      tokens[papel] = conta.accessToken;

      if (papel !== 'professor') {
        await prisma.user.update({
          where: { email },
          data: { papel: papel === 'master' ? 'MASTER' : 'PROFESSOR' },
        });
      } else {
        await prisma.user.update({ where: { email }, data: { papel: 'PROFESSOR' } });
      }

      // O papel é lido do banco a cada pedido, mas o token precisa ser novo
      // para o resto da sessão refletir a mudança.
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'segredo123' })
        .expect(200);
      tokens[papel] = login.body.accessToken as string;
    }

    // Três práticas avulsas para montar a trilha.
    for (const numero of [1, 2, 3]) {
      const resposta = await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send({ ...fichaValida, titulo: `Aula de trilha ${numero} — ${marca}` })
        .expect(201);
      praticas.push(resposta.body.id as string);
    }
  });

  afterAll(async () => {
    await prisma.content.deleteMany({ where: { id: { in: praticas } } });
    await prisma.track.deleteMany({ where: { nome: { contains: String(marca) } } });
    await prisma.user.deleteMany({ where: { email: { in: Object.values(contas) } } });
    await app.close();
  });

  it('cria a trilha com número de aulas e descrição', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/painel/trilhas')
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ nome: `Mobilidade ${marca}`, descricao: 'Coluna em três aulas', totalAulas: 3 })
      .expect(201);

    trilhaId = resposta.body.id as string;
    expect(trilhaId).toMatch(/^TRILHA-/);
  });

  it('recusa trilha de uma aula só', async () => {
    await request(app.getHttpServer())
      .post('/painel/trilhas')
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ nome: `Curta demais ${marca}`, totalAulas: 1 })
      .expect(400);
  });

  it('numera as aulas de 1 em diante, na ordem recebida', async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: [praticas[2], praticas[0], praticas[1]] })
      .expect(200);

    expect(resposta.body.aulas.map((aula: { id: string }) => aula.id)).toEqual([
      praticas[2],
      praticas[0],
      praticas[1],
    ]);
    expect(resposta.body.aulas.map((aula: { ordemTrilha: number }) => aula.ordemTrilha)).toEqual([
      1, 2, 3,
    ]);
  });

  it('reordenar não deixa buraco nem repetição', async () => {
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: [praticas[0], praticas[1], praticas[2]] })
      .expect(200);

    const aulas = await prisma.content.findMany({
      where: { trilhaId },
      orderBy: { ordemTrilha: 'asc' },
      select: { ordemTrilha: true },
    });

    expect(aulas.map((aula) => aula.ordemTrilha)).toEqual([1, 2, 3]);
  });

  it('recusa a mesma prática duas vezes na trilha', async () => {
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: [praticas[0], praticas[0]] })
      .expect(400);
  });

  it('tirar uma aula da lista renumera as que ficam', async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: [praticas[0], praticas[2]] })
      .expect(200);

    expect(resposta.body.aulas.map((aula: { ordemTrilha: number }) => aula.ordemTrilha)).toEqual([
      1, 2,
    ]);

    // A que saiu volta a ser avulsa, sem posição sobrando.
    const solta = await prisma.content.findUnique({
      where: { id: praticas[1] },
      select: { trilhaId: true, ordemTrilha: true },
    });
    expect(solta?.trilhaId).toBeNull();
    expect(solta?.ordemTrilha).toBeNull();

    // Devolve a aula à trilha para os testes seguintes.
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: praticas })
      .expect(200);
  });

  it('a prática que entra pela ficha vai para o fim da trilha, sem número digitado', async () => {
    const nova = await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ ...fichaValida, titulo: `Aula pela ficha ${marca}`, trilhaId })
      .expect(201);
    praticas.push(nova.body.id as string);

    const gravada = await prisma.content.findUnique({
      where: { id: nova.body.id as string },
      select: { ordemTrilha: true },
    });
    expect(gravada?.ordemTrilha).toBe(4);
  });

  it('salvar a ficha de novo não reembaralha a trilha', async () => {
    const primeira = praticas[0] as string;
    await request(app.getHttpServer())
      .put(`/painel/conteudos/${primeira}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ ...fichaValida, titulo: `Título corrigido ${marca}`, trilhaId })
      .expect(200);

    const gravada = await prisma.content.findUnique({
      where: { id: primeira },
      select: { ordemTrilha: true },
    });
    expect(gravada?.ordemTrilha).toBe(1);
  });

  it('recusa pré-requisito que fecha um ciclo', async () => {
    const segunda = await request(app.getHttpServer())
      .post('/painel/trilhas')
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ nome: `Avançada ${marca}`, totalAulas: 3, preRequisitoId: trilhaId })
      .expect(201);

    // A primeira passar a exigir a segunda fecharia o círculo: nenhuma abriria.
    const resposta = await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({
        nome: `Mobilidade ${marca}`,
        totalAulas: 3,
        preRequisitoId: segunda.body.id as string,
      })
      .expect(400);

    expect(String(resposta.body.message)).toContain('depende desta trilha');
  });

  it('recusa trilha como pré-requisito dela mesma', async () => {
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ nome: `Mobilidade ${marca}`, totalAulas: 3, preRequisitoId: trilhaId })
      .expect(400);
  });

  it('a lista de pré-requisitos não oferece quem fecharia o ciclo', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/painel/trilhas/pre-requisitos?trilha=${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .expect(200);

    const ids = resposta.body.map((trilha: { id: string }) => trilha.id);
    expect(ids).not.toContain(trilhaId);
  });

  it('avisa quando faltam aulas e quando elas não estão aprovadas', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/painel/trilhas/${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .expect(200);

    expect(resposta.body.problemas.join(' ')).toContain('não foram aprovadas');
  });

  it('professor não mexe na trilha de outro professor', async () => {
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.outroProfessor}`)
      .send({ nome: 'Tomada', totalAulas: 3 })
      .expect(403);
  });

  it('mas enxerga a trilha, para poder encaixar a aula dele', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/painel/trilhas')
      .set('Authorization', `Bearer ${tokens.outroProfessor}`)
      .expect(200);

    expect(resposta.body.map((trilha: { id: string }) => trilha.id)).toContain(trilhaId);
  });

  it('o master mexe em qualquer trilha', async () => {
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${trilhaId}`)
      .set('Authorization', `Bearer ${tokens.master}`)
      .send({ nome: `Mobilidade revista ${marca}`, totalAulas: 4 })
      .expect(200);
  });

  it('apagar a trilha solta as aulas em vez de apagá-las', async () => {
    const descartavel = await request(app.getHttpServer())
      .post('/painel/trilhas')
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ nome: `Descartavel ${marca}`, totalAulas: 2 })
      .expect(201);

    const id = descartavel.body.id as string;
    await request(app.getHttpServer())
      .put(`/painel/trilhas/${id}/aulas`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .send({ aulas: [praticas[0]] })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/painel/trilhas/${id}`)
      .set('Authorization', `Bearer ${tokens.professor}`)
      .expect(200);

    const aula = await prisma.content.findUnique({
      where: { id: praticas[0] as string },
      select: { trilhaId: true, ordemTrilha: true },
    });
    expect(aula).not.toBeNull();
    expect(aula?.trilhaId).toBeNull();
    expect(aula?.ordemTrilha).toBeNull();
  });

  it('aluno não chega às trilhas do painel', async () => {
    const aluno = await criarContaVerificada(app, {
      nome: 'Aluna comum',
      email: `trilha-aluna-${marca}@life.local`,
    });

    await request(app.getHttpServer())
      .get('/painel/trilhas')
      .set('Authorization', `Bearer ${aluno.accessToken}`)
      .expect(403);

    await prisma.user.delete({ where: { id: aluno.id } });
  });
});
