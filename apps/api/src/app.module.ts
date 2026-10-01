import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';
import { HojeModule } from './hoje/hoje.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { PainelModule } from './painel/painel.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EmailModule } from './email/email.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // F2.7 — teto geral de pedidos. As rotas de conta têm limites próprios,
    // bem mais apertados, declarados em cada uma.
    ThrottlerModule.forRoot([{ name: 'geral', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    EmailModule,
    AuthModule,
    OnboardingModule,
    HojeModule,
    CatalogoModule,
    PainelModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
