import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CheckinService } from '../checkin/checkin.service.js';
import { HojeController } from './hoje.controller.js';
import { HojeService } from './hoje.service.js';

@Module({
  imports: [AuthModule],
  controllers: [HojeController],
  providers: [HojeService, CheckinService],
})
export class HojeModule {}
