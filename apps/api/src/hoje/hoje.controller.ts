import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { Matches } from 'class-validator';
import { JwtGuard, UsuarioId } from '../auth/jwt.guard.js';
import { CheckinService } from '../checkin/checkin.service.js';
import { CheckinDto } from '../checkin/dto/checkin.dto.js';
import { HojeService } from './hoje.service.js';

class DiaDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Dia deve ser AAAA-MM-DD' })
  dia!: string;
}

@Controller()
@UseGuards(JwtGuard)
export class HojeController {
  constructor(
    private readonly hoje: HojeService,
    private readonly checkins: CheckinService,
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
}
