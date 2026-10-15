import { Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { AprenderService } from './aprender.service.js';
import { FiltrosDeCursosDto } from './dto/filtros-de-cursos.dto.js';
import { DiaDto } from './dto/dia.dto.js';

/**
 * O Aprender, pelo lado do aluno (EDU-01 a EDU-06).
 *
 * Só conteúdo aprovado sai daqui, como no catálogo de práticas: o que está em
 * revisão é do painel, não do app.
 */
@Controller('aprender')
@UseGuards(JwtGuard)
export class AprenderController {
  constructor(private readonly aprender: AprenderService) {}

  /** Tudo da primeira dobra numa chamada só. */
  @Get('inicio')
  inicio(@UsuarioId() usuarioId: string, @Query() dados: DiaDto) {
    return this.aprender.inicio(usuarioId, dados.dia);
  }

  @Get('cursos')
  listarCursos(@Query() filtros: FiltrosDeCursosDto) {
    return this.aprender.listarCursos(filtros);
  }

  /** Temas, níveis e tipos que existem, para a tela não oferecer filtro vazio. */
  @Get('cursos/filtros')
  filtros() {
    return this.aprender.filtrosDisponiveis();
  }

  @Get('cursos/:id')
  detalharCurso(@Param('id') id: string, @UsuarioId() usuarioId: string) {
    return this.aprender.detalharCurso(id, usuarioId);
  }

  @Get('aulas/:id')
  detalharAula(@Param('id') id: string, @UsuarioId() usuarioId: string) {
    return this.aprender.detalharAula(id, usuarioId);
  }

  /** EDU-02: marcar como concluída. */
  @Post('aulas/:id/conclusao')
  @HttpCode(200)
  concluir(@Param('id') id: string, @UsuarioId() usuarioId: string) {
    return this.aprender.concluirAula(id, usuarioId);
  }
}
