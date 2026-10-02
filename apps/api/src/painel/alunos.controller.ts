import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard.js';
import { Papeis, PapeisGuard } from '../auth/papeis.guard.js';
import { AlunosService } from './alunos.service.js';

/**
 * Visão de quem administra: números do painel e lista de alunos.
 *
 * Fica fora do controller de conteúdos porque não é sobre conteúdo — e
 * porque `/painel/conteudos/alunos` seria um endereço mentiroso.
 */
@Controller('painel')
@UseGuards(JwtGuard, PapeisGuard)
@Papeis('MASTER', 'ADMIN')
export class AlunosController {
  constructor(private readonly alunos: AlunosService) {}

  /** Números do topo do painel. */
  @Get('resumo')
  resumo() {
    return this.alunos.resumo();
  }

  /**
   * ADM-10 — quem usa o app.
   *
   * Sem nada de saúde: nem condições, nem dor, nem check-in. Só quem é a
   * pessoa e se ela está praticando (PRIV-02).
   */
  @Get('alunos')
  listar() {
    return this.alunos.listar();
  }
}
