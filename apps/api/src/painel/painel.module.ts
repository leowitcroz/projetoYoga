import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PapeisGuard } from '../auth/papeis.guard.js';
import { PainelController } from './painel.controller.js';
import { AlunosController } from './alunos.controller.js';
import { PainelService } from './painel.service.js';
import { AlunosService } from './alunos.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PainelController, AlunosController],
  providers: [PainelService, AlunosService, PapeisGuard],
})
export class PainelModule {}
