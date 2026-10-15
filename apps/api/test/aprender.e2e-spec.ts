import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { CURSOS_DE_TESTE } from './../src/aprender/cursos-de-teste.js';
import { criarContaVerificada } from './conta-de-teste.js';

/**
 * O Aprender (EDU-01 a EDU-06).
 *
 * O que estes testes protegem: só conteúdo aprovado sai para o aluno, o
 * progresso não se duplica, a aula do dia não troca dentro do mesmo dia e o
 * "para você" não vira lista genérica para quem não disse o que quer estudar.
 */
describe('Aprender (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const marca = Date.now();
  const hoje = '2026-10-15';
  let token = '';
  let usuarioId = '';
  const emails: string[] = [];

  async function aluno(nome: string, temas?: string[]) {
    const email = `aprender-${nome}-${marca}@life.local`;
    emails.push(email);
    return criarContaVerificada(app, {
      nome,
      email,
      ...(temas ? { onboarding: { objetivoPrincipal: 'sono', temas } } : {}),
    });
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

    for (const curso of CURSOS_DE_TESTE) {
      const { aulas, ...dados } = curso;
      await prisma.course.upsert({
        where: { id: curso.id },
        create: { ...dados, status: 'APROVADO' },
        update: { ...dados, status: 'APROVADO' },
      });
      for (const [posicao, aula] of aulas.entries()) {
        const id = `${curso.id}-A${String(posicao + 1).padStart(2, '0')}`;
        const linha = { ...aula, cursoId: curso.id, ordem: posicao + 1 };
        await prisma.lesson.upsert({ where: { id }, create: { id, ...linha }, update: linha });
      }
    }

    const conta = await aluno('principal', ['filosofia']);
    token = conta.accessToken;
    usuarioId = conta.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await app.close();
  });

  function pedir(caminho: string) {
    return request(app.getHttpServer()).get(caminho).set('Authorization', `Bearer ${token}`);
  }

  it('exige login', async () => {
    await request(app.getHttpServer()).get('/aprender/cursos').expect(401);
  });

  describe('catálogo (EDU-01)', () => {
    it('lista os cursos com a contagem de aulas', async () => {
      const resposta = await pedir('/aprender/cursos').expect(200);

      const curso = resposta.body.find((item: { id: string }) => item.id === 'CURSO-002');
      expect(curso.totalAulas).toBe(5);
      expect(curso.tema).toBe('filosofia');
    });

    it('filtra por tema', async () => {
      const resposta = await pedir('/aprender/cursos?tema=fisiologia').expect(200);

      expect(resposta.body.length).toBeGreaterThan(0);
      for (const curso of resposta.body) expect(curso.tema).toBe('fisiologia');
    });

    it('filtra por nível', async () => {
      const resposta = await pedir('/aprender/cursos?nivel=1').expect(200);
      for (const curso of resposta.body) expect(curso.nivel).toBe(1);
    });

    it('filtrar por tipo olha as aulas, não o curso', async () => {
      const resposta = await pedir('/aprender/cursos?tipo=texto').expect(200);

      expect(resposta.body.length).toBeGreaterThan(0);
      for (const curso of resposta.body) {
        const aulas = await prisma.lesson.findMany({
          where: { cursoId: curso.id as string },
          select: { tipo: true },
        });
        expect(aulas.some((aula) => aula.tipo === 'texto')).toBe(true);
      }
    });

    it('recusa tema e tipo inventados', async () => {
      await pedir('/aprender/cursos?tema=culinaria').expect(400);
      await pedir('/aprender/cursos?tipo=pergaminho').expect(400);
    });

    it('não entrega curso que não foi aprovado', async () => {
      await prisma.course.create({
        data: {
          id: `CURSO-RASCUNHO-${marca}`,
          titulo: 'Em preparação',
          tema: 'yoga',
          status: 'RASCUNHO',
        },
      });

      const lista = await pedir('/aprender/cursos').expect(200);
      expect(lista.body.map((c: { id: string }) => c.id)).not.toContain(`CURSO-RASCUNHO-${marca}`);

      await pedir(`/aprender/cursos/CURSO-RASCUNHO-${marca}`).expect(404);
      await prisma.course.delete({ where: { id: `CURSO-RASCUNHO-${marca}` } });
    });
  });

  describe('aula do dia (EDU-05)', () => {
    it('é a mesma durante o dia inteiro', async () => {
      const primeira = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
      const segunda = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);

      expect(segunda.body.aulaDoDia.id).toBe(primeira.body.aulaDoDia.id);
    });

    it('troca de um dia para o outro', async () => {
      // Dias diferentes não precisam dar aulas diferentes sempre — com poucas
      // aulas, cair na mesma é normal. O que se cobra é que o sorteio mude com
      // o dia, e não que seja o mesmo valor para toda data.
      const resultados = new Set<string>();
      for (const dia of ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19']) {
        const resposta = await pedir(`/aprender/inicio?dia=${dia}`).expect(200);
        resultados.add(resposta.body.aulaDoDia.id as string);
      }
      expect(resultados.size).toBeGreaterThan(1);
    });

    it('duas pessoas no mesmo dia não recebem forçosamente a mesma', async () => {
      const outro = await aluno('outro');
      const dele = await request(app.getHttpServer())
        .get(`/aprender/inicio?dia=${hoje}`)
        .set('Authorization', `Bearer ${outro.accessToken}`)
        .expect(200);

      expect(dele.body.aulaDoDia).not.toBeNull();
    });

    it('recusa dia fora do formato', async () => {
      await pedir('/aprender/inicio?dia=15-10-2026').expect(400);
    });
  });

  describe('progresso e "Continue estudando" (EDU-02, EDU-03)', () => {
    it('sem nada concluído, não há o que continuar', async () => {
      const resposta = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
      expect(resposta.body.continueEstudando).toBeNull();
    });

    it('concluir uma aula aponta a próxima', async () => {
      await request(app.getHttpServer())
        .post('/aprender/aulas/CURSO-002-A01/conclusao')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const resposta = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
      const continuar = resposta.body.continueEstudando;

      expect(continuar.curso.id).toBe('CURSO-002');
      expect(continuar.proxima.ordem).toBe(2);
      expect(continuar.concluidas).toBe(1);
      expect(continuar.totalAulas).toBe(5);
    });

    it('concluir duas vezes não conta duas vezes', async () => {
      await request(app.getHttpServer())
        .post('/aprender/aulas/CURSO-002-A01/conclusao')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const curso = await pedir('/aprender/cursos/CURSO-002').expect(200);
      expect(curso.body.concluidas).toBe(1);
    });

    it('curso terminado some do "Continue estudando"', async () => {
      const quemTerminou = await aluno('curso-inteiro');
      const aulas = await prisma.lesson.findMany({
        where: { cursoId: 'CURSO-004' },
        select: { id: true },
      });

      for (const aula of aulas) {
        await request(app.getHttpServer())
          .post(`/aprender/aulas/${aula.id}/conclusao`)
          .set('Authorization', `Bearer ${quemTerminou.accessToken}`)
          .expect(200);
      }

      const resposta = await request(app.getHttpServer())
        .get(`/aprender/inicio?dia=${hoje}`)
        .set('Authorization', `Bearer ${quemTerminou.accessToken}`)
        .expect(200);

      expect(resposta.body.continueEstudando).toBeNull();
    });

    it('o progresso é de cada pessoa', async () => {
      const estranho = await aluno('estranho');
      const curso = await request(app.getHttpServer())
        .get('/aprender/cursos/CURSO-002')
        .set('Authorization', `Bearer ${estranho.accessToken}`)
        .expect(200);

      expect(curso.body.concluidas).toBe(0);
    });

    it('não marca aula que não existe', async () => {
      await request(app.getHttpServer())
        .post('/aprender/aulas/NAO-EXISTE/conclusao')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('cursos recomendados', () => {
    it('respeita os temas declarados no cadastro', async () => {
      const resposta = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
      const { porTema, cursos } = resposta.body.recomendados;

      expect(porTema).toBe(true);
      for (const curso of cursos) expect(curso.tema).toBe('filosofia');
    });

    it('quem não declarou tema recebe começos curtos, e a tela sabe disso', async () => {
      const semTemas = await aluno('sem-temas');
      const resposta = await request(app.getHttpServer())
        .get(`/aprender/inicio?dia=${hoje}`)
        .set('Authorization', `Bearer ${semTemas.accessToken}`)
        .expect(200);

      expect(resposta.body.recomendados.porTema).toBe(false);
      expect(resposta.body.recomendados.cursos.length).toBeGreaterThan(0);
    });

    it('não oferece curso que a pessoa já começou', async () => {
      const resposta = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
      const ids = resposta.body.recomendados.cursos.map((curso: { id: string }) => curso.id);

      expect(ids).not.toContain('CURSO-002');
    });
  });

  it('a aula de leitura entrega o texto; a lista nunca entrega', async () => {
    const curso = await pedir('/aprender/cursos/CURSO-001').expect(200);
    for (const aula of curso.body.aulas) expect(aula).not.toHaveProperty('texto');

    const aula = await pedir('/aprender/aulas/CURSO-001-A03').expect(200);
    expect(aula.body.tipo).toBe('texto');
    expect(aula.body).toHaveProperty('texto');
  });

  it('o usuário certo é quem o token diz', async () => {
    const resposta = await pedir(`/aprender/inicio?dia=${hoje}`).expect(200);
    const eventos = await prisma.lessonEvent.count({ where: { userId: usuarioId } });

    expect(resposta.body.continueEstudando).not.toBeNull();
    expect(eventos).toBeGreaterThan(0);
  });
});
