import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AprenderController } from './aprender.controller.js';
import { AprenderService } from './aprender.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AprenderController],
  providers: [AprenderService],
})
export class AprenderModule {}
