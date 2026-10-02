import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { Papeis, PapeisGuard, PapelDoUsuario, type Papel } from '../auth/papeis.guard.js';
import { OrdemDaTrilhaDto, TrilhaDto } from './dto/trilha.dto.js';
import { TrilhasService } from './trilhas.service.js';

/**
 * Trilhas do catálogo (ADM-05).
 *
 * Controller próprio, e não mais uma rota em `painel/conteudos`: uma trilha
 * não é um conteúdo, e `/painel/conteudos/trilhas` seria mentira.
 */
@Controller('painel/trilhas')
@UseGuards(JwtGuard, PapeisGuard)
@Papeis('PROFESSOR', 'MASTER', 'ADMIN')
export class TrilhasController {
  constructor(private readonly trilhas: TrilhasService) {}

  @Get()
  listar() {
    return this.trilhas.listar();
  }

  /** As que podem virar pré-requisito sem fechar um ciclo. */
  @Get('pre-requisitos')
  preRequisitos(@Query('trilha') trilha?: string) {
    return this.trilhas.possiveisPreRequisitos(trilha);
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.trilhas.buscar(id);
  }

  @Post()
  criar(@UsuarioId() usuarioId: string, @Body() dados: TrilhaDto) {
    return this.trilhas.criar(usuarioId, dados);
  }

  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
    @Body() dados: TrilhaDto,
  ) {
    return this.trilhas.atualizar(id, usuarioId, papel, dados);
  }

  /** A lista inteira, na ordem desejada. A API numera de 1 em diante. */
  @Put(':id/aulas')
  definirOrdem(
    @Param('id') id: string,
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
    @Body() dados: OrdemDaTrilhaDto,
  ) {
    return this.trilhas.definirOrdem(id, usuarioId, papel, dados.aulas);
  }

  @Delete(':id')
  remover(
    @Param('id') id: string,
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
  ) {
    return this.trilhas.remover(id, usuarioId, papel);
  }
}
