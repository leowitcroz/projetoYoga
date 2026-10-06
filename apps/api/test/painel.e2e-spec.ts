import { Test, type TestingModule } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { criarContaVerificada } from './conta-de-teste.js';

/**
 * Painel dos professores: quem pode o quê (ADM-01, ADM-06, ADM-10) e o
 * caminho do conteúdo até aparecer para o aluno.
 */
describe('Painel (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const marca = Date.now();
  const contas = {
    aluno: `aluno-${marca}@life.local`,
    professor: `prof-${marca}@life.local`,
    outroProfessor: `prof2-${marca}@life.local`,
    master: `master-${marca}@life.local`,
  };
  const senha = 'segredo123';
  const tokens: Record<string, string> = {};
  let praticaId = '';

  const fichaValida = {
    titulo: 'Prática de teste do painel',
    modalidade: 'hatha',
    area: 'asanas',
    duracaoMin: 25,
    nivelTecnico: 2,
    demandaFisica: 2,
    professor: 'Professor de Teste',
    objetivos: { estresse: 5, sono: 3 },
    caracteristicas: {
      intensidade: 2,
      mobilidade: 3,
      respiracaoCalma: 4,
      yogaNidra: 0,
      relaxamento: 4,
      ativacao: 1,
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

  async function cadastrar(email: string): Promise<string> {
    const conta = await criarContaVerificada(app, { nome: `Pessoa ${email}`, email, senha });
    return conta.accessToken;
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

    for (const [papel, email] of Object.entries(contas)) {
      tokens[papel] = await cadastrar(email);
    }

    // Os papéis são dados fora do app: ninguém vira professor se cadastrando.
    await prisma.user.update({ where: { email: contas.professor }, data: { papel: 'PROFESSOR' } });
    await prisma.user.update({
      where: { email: contas.outroProfessor },
      data: { papel: 'PROFESSOR' },
    });
    await prisma.user.update({ where: { email: contas.master }, data: { papel: 'MASTER' } });
  });

  afterAll(async () => {
    if (praticaId) await prisma.content.deleteMany({ where: { id: praticaId } });
    await prisma.user.deleteMany({ where: { email: { in: Object.values(contas) } } });
    await app.close();
  });

  function como(papel: keyof typeof contas) {
    return { Authorization: `Bearer ${tokens[papel]}` };
  }

  it('ADM-01: aluno não entra no painel', async () => {
    await request(app.getHttpServer()).get('/painel/conteudos').set(como('aluno')).expect(403);
    await request(app.getHttpServer()).get('/painel/conteudos').expect(401);
  });

  it('ADM-02: professor cadastra uma prática, que nasce como rascunho', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('professor'))
      .send(fichaValida)
      .expect(201);

    praticaId = resposta.body.id as string;
    expect(praticaId).toMatch(/^PRAT-/);
    expect(resposta.body.status).toBe('RASCUNHO');
  });

  it('recusa ficha incompleta em vez de gravar pela metade', async () => {
    await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('professor'))
      .send({ ...fichaValida, titulo: 'ab' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('professor'))
      .send({ ...fichaValida, seguranca: { ...fichaValida.seguranca, cargaCervical: 9 } })
      .expect(400);
  });

  it('MOT-02: rascunho não aparece para o aluno', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/catalogo')
      .set(como('aluno'))
      .expect(200);

    expect(resposta.body.map((aula: { id: string }) => aula.id)).not.toContain(praticaId);
  });

  it('F3.13: professor não vê o rascunho de outro professor', async () => {
    await request(app.getHttpServer())
      .get(`/painel/conteudos/${praticaId}`)
      .set(como('outroProfessor'))
      .expect(403);

    const lista = await request(app.getHttpServer())
      .get('/painel/conteudos')
      .set(como('outroProfessor'))
      .expect(200);
    expect(lista.body.map((item: { id: string }) => item.id)).not.toContain(praticaId);
  });

  it('o master vê o conteúdo de todo mundo', async () => {
    await request(app.getHttpServer())
      .get(`/painel/conteudos/${praticaId}`)
      .set(como('master'))
      .expect(200);
  });

  it('F3.13: professor não aprova', async () => {
    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/aprovacao`)
      .set(como('professor'))
      .expect(403);
  });

  it('ADM-06: rascunho não pode ser aprovado direto, precisa ir para revisão', async () => {
    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/aprovacao`)
      .set(como('master'))
      .expect(400);

    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/revisao`)
      .set(como('professor'))
      .expect(201);

    const fila = await request(app.getHttpServer())
      .get('/painel/conteudos/fila')
      .set(como('master'))
      .expect(200);
    expect(fila.body.map((item: { id: string }) => item.id)).toContain(praticaId);
  });

  it('ADM-06: o master devolve com um comentário', async () => {
    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/devolucao`)
      .set(como('master'))
      .send({ comentario: 'Confira a carga lombar: a sequência tem extensões profundas.' })
      .expect(201);

    const conteudo = await request(app.getHttpServer())
      .get(`/painel/conteudos/${praticaId}`)
      .set(como('professor'))
      .expect(200);

    expect(conteudo.body.status).toBe('DEVOLVIDO');
    expect(conteudo.body.comentarioRevisao).toContain('carga lombar');
  });

  it('F3.15: depois de aprovado, o conteúdo aparece para o aluno', async () => {
    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/revisao`)
      .set(como('professor'))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/painel/conteudos/${praticaId}/aprovacao`)
      .set(como('master'))
      .expect(201);

    const catalogo = await request(app.getHttpServer())
      .get('/catalogo')
      .set(como('aluno'))
      .expect(200);

    expect(catalogo.body.map((aula: { id: string }) => aula.id)).toContain(praticaId);
  });

  it('ADM-06: editar prática aprovada devolve para revisão, não muda no ar sozinha', async () => {
    await request(app.getHttpServer())
      .put(`/painel/conteudos/${praticaId}`)
      .set(como('professor'))
      .send({ ...fichaValida, titulo: 'Prática de teste do painel (revisada)' })
      .expect(200);

    const conteudo = await request(app.getHttpServer())
      .get(`/painel/conteudos/${praticaId}`)
      .set(como('master'))
      .expect(200);

    expect(conteudo.body.status).toBe('EM_REVISAO');
  });

  it('ninguém aprova a própria prática', async () => {
    const minha = await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('master'))
      .send({ ...fichaValida, titulo: 'Prática do próprio master' })
      .expect(201);

    const id = minha.body.id as string;
    await request(app.getHttpServer())
      .post(`/painel/conteudos/${id}/revisao`)
      .set(como('master'))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/painel/conteudos/${id}/aprovacao`)
      .set(como('master'))
      .expect(403);

    await prisma.content.deleteMany({ where: { id } });
  });

  it('P-03: aceita o link do YouTube e guarda só o identificador', async () => {
    const criada = await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('professor'))
      .send({
        ...fichaValida,
        titulo: 'Prática com vídeo',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1',
      })
      .expect(201);

    const conteudo = await prisma.content.findUnique({ where: { id: criada.body.id as string } });

    // Guardamos provedor + id, nunca a URL: é o que torna barata a troca
    // de provedor mais tarde.
    expect(conteudo?.videoProvedor).toBe('youtube');
    expect(conteudo?.videoId).toBe('dQw4w9WgXcQ');

    await prisma.content.deleteMany({ where: { id: criada.body.id as string } });
  });

  it('P-03: recusa link que não dá para ler, em vez de gravar sem vídeo', async () => {
    await request(app.getHttpServer())
      .post('/painel/conteudos')
      .set(como('professor'))
      .send({ ...fichaValida, titulo: 'Link torto', videoUrl: 'https://vimeo.com/123456' })
      .expect(400);
  });

  it('ADM-10: o master vê os alunos, mas nenhum dado de saúde (PRIV-02)', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/painel/alunos')
      .set(como('master'))
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);

    const texto = JSON.stringify(resposta.body);
    for (const proibido of ['condicoes', 'regiaoDaDor', 'dor', 'humor', 'estresse', 'senhaHash']) {
      expect(texto).not.toContain(proibido);
    }
  });

  it('ADM-10: professor não vê a lista de alunos', async () => {
    await request(app.getHttpServer()).get('/painel/alunos').set(como('professor')).expect(403);
    await request(app.getHttpServer()).get('/painel/resumo').set(como('professor')).expect(403);
  });

  it('o resumo conta o que precisa de atenção', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/painel/resumo')
      .set(como('master'))
      .expect(200);

    for (const campo of [
      'alunos',
      'rascunhos',
      'emRevisao',
      'aprovadas',
      'devolvidas',
      'semVideo',
    ]) {
      expect(typeof resposta.body[campo]).toBe('number');
    }
  });

  it('ADM-01: conta de equipe não entra no aplicativo de aluno', async () => {
    // O app recusa pelo papel que vem no login; aqui conferimos que ele vem.
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: contas.master, senha })
      .expect(200);

    expect(login.body.usuario.papel).toBe('MASTER');
  });

  it('F3.14: nenhuma rota do painel devolve dado de saúde de aluno', async () => {
    const lista = await request(app.getHttpServer())
      .get('/painel/conteudos')
      .set(como('master'))
      .expect(200);

    const texto = JSON.stringify(lista.body);
    for (const proibido of ['condicoes', 'regiaoDaDor', 'healthProfile', 'checkin']) {
      expect(texto).not.toContain(proibido);
    }
  });

  describe('estrutura da prática (PRA-07)', () => {
    const comBlocos = (blocos: { tipo: string; minutos: number }[], duracaoMin = 25) => ({
      ...fichaValida,
      titulo: `Estrutura ${Date.now()}${Math.random()}`,
      duracaoMin,
      estrutura: blocos,
    });

    it('recusa blocos que não somam a duração', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send(
          comBlocos([
            { tipo: 'preparacao', minutos: 4 },
            { tipo: 'asanas', minutos: 14 },
          ]),
        )
        .expect(400);

      expect(String(resposta.body.message)).toContain('somam 18');
    });

    it('aceita quando a soma bate', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send(
          comBlocos([
            { tipo: 'preparacao', minutos: 4 },
            { tipo: 'asanas', minutos: 14 },
            { tipo: 'pranayama', minutos: 3 },
            { tipo: 'relaxamento', minutos: 4 },
          ]),
        )
        .expect(201);

      const gravada = await prisma.content.findUnique({
        where: { id: resposta.body.id as string },
        select: { estrutura: true },
      });
      expect(gravada?.estrutura).toEqual([
        { tipo: 'preparacao', minutos: 4 },
        { tipo: 'asanas', minutos: 14 },
        { tipo: 'pranayama', minutos: 3 },
        { tipo: 'relaxamento', minutos: 4 },
      ]);

      await prisma.content.delete({ where: { id: resposta.body.id as string } });
    });

    it('recusa o mesmo bloco duas vezes', async () => {
      await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send(
          comBlocos([
            { tipo: 'asanas', minutos: 12 },
            { tipo: 'asanas', minutos: 13 },
          ]),
        )
        .expect(400);
    });

    it('recusa bloco que não é da biblioteca', async () => {
      await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send(comBlocos([{ tipo: 'cafezinho', minutos: 25 }]))
        .expect(400);
    });

    it('prática sem estrutura continua valendo', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/painel/conteudos')
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send({ ...fichaValida, titulo: `Sem estrutura ${Date.now()}` })
        .expect(201);

      const gravada = await prisma.content.findUnique({
        where: { id: resposta.body.id as string },
        select: { estrutura: true },
      });
      expect(gravada?.estrutura).toBeNull();

      await prisma.content.delete({ where: { id: resposta.body.id as string } });
    });
  });
});
