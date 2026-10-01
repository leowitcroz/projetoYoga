import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, Matches } from 'class-validator';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { CheckinService } from '../checkin/checkin.service.js';
import { CheckinDto } from '../checkin/dto/checkin.dto.js';
import { HojeService } from './hoje.service.js';
import { EventosService } from './eventos.service.js';
import { EventoDto, FeedbackDto } from './dto/evento.dto.js';

class DiaDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;
}

/** Resposta da pergunta adaptativa (CTX-001). */
class ContextoDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;

  @IsBoolean()
  refeicaoRecente!: boolean;
}

@Controller()
@UseGuards(JwtGuard)
export class HojeController {
  constructor(
    private readonly hoje: HojeService,
    private readonly checkins: CheckinService,
    private readonly eventos: EventosService,
  ) {}

  /** CHK-01 a CHK-04 — grava o check-in do dia. */
  @Put('checkin')
  salvarCheckin(@UsuarioId() usuarioId: string, @Body() dados: CheckinDto) {
    return this.checkins.salvar(usuarioId, dados);
  }

  /**
   * MOT-08 — a prática de hoje.
   *
   * O dia vem do aparelho porque é o fuso de quem pratica que manda (CHK-02);
   * o servidor pode estar em outro.
   */
  @Get('hoje')
  recomendar(@UsuarioId() usuarioId: string, @Query() query: DiaDto) {
    return this.hoje.recomendar(usuarioId, query.dia, new Date());
  }

  /**
   * MOT-18 — responde a pergunta adaptativa e refaz a recomendação.
   *
   * A resposta entra no check-in do dia, então vale para as próximas vezes
   * que a pessoa abrir a Home hoje.
   */
  @Put('checkin/contexto')
  async responderContexto(@UsuarioId() usuarioId: string, @Body() dados: ContextoDto) {
    await this.checkins.responderContexto(usuarioId, dados.dia, dados.refeicaoRecente);
    return this.hoje.recomendar(usuarioId, dados.dia, new Date());
  }

  /** F2.18 — o que a pessoa fez com a prática. */
  @Post('praticas/:id/eventos')
  registrarEvento(
    @UsuarioId() usuarioId: string,
    @Param('id') conteudoId: string,
    @Body() dados: EventoDto,
  ) {
    return this.eventos.registrar(usuarioId, conteudoId, dados);
  }

  /** F2.18 — feedback de depois da prática. */
  @Post('praticas/:id/feedback')
  avaliar(
    @UsuarioId() usuarioId: string,
    @Param('id') conteudoId: string,
    @Body() dados: FeedbackDto,
  ) {
    return this.eventos.avaliar(usuarioId, conteudoId, dados);
  }
}
