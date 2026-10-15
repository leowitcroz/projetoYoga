import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';
import { HojeModule } from './hoje/hoje.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { AprenderModule } from './aprender/aprender.module.js';
import { PainelModule } from './painel/painel.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LimiteDeTentativasGuard } from './comum/limite-de-tentativas.guard.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EmailModule } from './email/email.module.js';
import { PrivacidadeModule } from './privacidade/privacidade.module.js';
import { RegistroDeAcessoInterceptor } from './privacidade/registro-de-acesso.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // F2.7 — teto geral de pedidos. As rotas de conta têm limites próprios,
    // bem mais apertados, declarados em cada uma.
    ThrottlerModule.forRoot([{ name: 'geral', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    PrivacidadeModule,
    EmailModule,
    AuthModule,
    OnboardingModule,
    HojeModule,
    CatalogoModule,
    AprenderModule,
    PainelModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: LimiteDeTentativasGuard },
    // PRIV-03: todo acesso fica registrado, sem exceção por esquecimento.
    { provide: APP_INTERCEPTOR, useClass: RegistroDeAcessoInterceptor },
  ],
})
export class AppModule {}
