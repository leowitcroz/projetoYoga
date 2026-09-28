import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';
import { HojeModule } from './hoje/hoje.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OnboardingModule,
    HojeModule,
    CatalogoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
