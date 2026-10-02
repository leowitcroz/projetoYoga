import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Quem usa o app, pelo lado de quem administra (ADM-10).
 *
 * Regra que atravessa tudo aqui: **nenhum papel vê dado de saúde individual**
 * (PRIV-02). Esta tela mostra quem é a pessoa e se ela está praticando — nunca
 * o que ela respondeu sobre dor, condições ou humor.
 */
@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const alunos = await this.prisma.user.findMany({
      where: { papel: 'ALUNO' },
      orderBy: { criadoEm: 'desc' },
      take: 200,
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        criadoEm: true,
        emailVerificadoEm: true,
        _count: { select: { eventos: true } },
      },
    });

    return alunos.map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      criadoEm: aluno.criadoEm,
      emailConfirmado: aluno.emailVerificadoEm !== null,
      praticas: aluno._count.eventos,
    }));
  }

  /** Números do topo do painel. */
  async resumo() {
    const [alunos, rascunhos, emRevisao, aprovadas, devolvidas, semVideo] = await Promise.all([
      this.prisma.user.count({ where: { papel: 'ALUNO' } }),
      this.prisma.content.count({ where: { status: 'RASCUNHO' } }),
      this.prisma.content.count({ where: { status: 'EM_REVISAO' } }),
      this.prisma.content.count({ where: { status: 'APROVADO' } }),
      this.prisma.content.count({ where: { status: 'DEVOLVIDO' } }),
      this.prisma.content.count({ where: { status: 'APROVADO', videoId: null } }),
    ]);

    return { alunos, rascunhos, emRevisao, aprovadas, devolvidas, semVideo };
  }
}
