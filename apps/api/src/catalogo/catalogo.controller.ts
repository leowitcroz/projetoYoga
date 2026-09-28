import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard.js';
import { CatalogoService } from './catalogo.service.js';
import { FiltrosDoCatalogoDto } from './dto/filtros.dto.js';

@Controller('catalogo')
@UseGuards(JwtGuard)
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get()
  listar(@Query() filtros: FiltrosDoCatalogoDto) {
    return this.catalogo.listar(filtros);
  }

  /** Alimenta os filtros da tela, para não inventarmos modalidades vazias. */
  @Get('modalidades')
  modalidades() {
    return this.catalogo.modalidades();
  }

  @Get(':id')
  detalhar(@Param('id') id: string) {
    return this.catalogo.detalhar(id);
  }
}
