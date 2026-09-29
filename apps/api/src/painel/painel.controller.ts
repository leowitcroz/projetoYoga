import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { Papeis, PapeisGuard, PapelDoUsuario, type Papel } from '../auth/papeis.guard.js';
import { ConteudoDto, DevolverDto } from './dto/conteudo.dto.js';
import { PainelService } from './painel.service.js';

/**
 * Rotas do painel (ADM-01 a ADM-06).
 *
 * Nenhuma delas devolve dado de aluno: o painel é sobre conteúdo, e dados de
 * saúde não passam por aqui (PRIV-02, ADM-10).
 */
@Controller('painel/conteudos')
@UseGuards(JwtGuard, PapeisGuard)
@Papeis('PROFESSOR', 'MASTER', 'ADMIN')
export class PainelController {
  constructor(private readonly painel: PainelService) {}

  @Get()
  listar(
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
    @Query('status') status?: string,
  ) {
    return this.painel.listar(usuarioId, papel, status);
  }

  /** Fila de revisão do master (F3.9). */
  @Get('fila')
  @Papeis('MASTER', 'ADMIN')
  fila() {
    return this.painel.fila();
  }

  @Get(':id')
  buscar(@Param('id') id: string, @UsuarioId() usuarioId: string, @PapelDoUsuario() papel: Papel) {
    return this.painel.buscar(id, usuarioId, papel);
  }

  @Post()
  criar(@UsuarioId() usuarioId: string, @Body() dados: ConteudoDto) {
    return this.painel.criar(usuarioId, dados);
  }

  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
    @Body() dados: ConteudoDto,
  ) {
    return this.painel.atualizar(id, usuarioId, papel, dados);
  }

  @Post(':id/revisao')
  enviarParaRevisao(
    @Param('id') id: string,
    @UsuarioId() usuarioId: string,
    @PapelDoUsuario() papel: Papel,
  ) {
    return this.painel.enviarParaRevisao(id, usuarioId, papel);
  }

  /** ADM-06: só o master aprova. */
  @Post(':id/aprovacao')
  @Papeis('MASTER', 'ADMIN')
  aprovar(@Param('id') id: string, @UsuarioId() usuarioId: string) {
    return this.painel.aprovar(id, usuarioId);
  }

  @Post(':id/devolucao')
  @Papeis('MASTER', 'ADMIN')
  devolver(@Param('id') id: string, @UsuarioId() usuarioId: string, @Body() dados: DevolverDto) {
    return this.painel.devolver(id, usuarioId, dados.comentario);
  }
}
