import { Global, Module } from '@nestjs/common';
import { PrivacidadeService } from './privacidade.service.js';
import { RegistroDeAcessoInterceptor } from './registro-de-acesso.interceptor.js';

@Global()
@Module({
  providers: [PrivacidadeService, RegistroDeAcessoInterceptor],
  exports: [PrivacidadeService, RegistroDeAcessoInterceptor],
})
export class PrivacidadeModule {}
