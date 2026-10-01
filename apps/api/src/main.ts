import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // O app roda em outra porta (e no celular, em outro endereço), então o
  // navegador precisa de permissão explícita para chamar a API.
  // Sem CORS_ORIGIN (desenvolvimento), qualquer endereço pode chamar.
  const origens = process.env.CORS_ORIGIN?.split(',').filter((item) => item.trim() !== '');
  app.enableCors({
    origin: origens && origens.length > 0 ? origens : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // F2.4 — documentação da API em /docs, só fora de produção: ela descreve
  // todas as rotas, inclusive as de conta, e não precisa estar no ar.
  if (process.env.NODE_ENV !== 'production') {
    const documento = new DocumentBuilder()
      .setTitle('LIFE — API')
      .setDescription(
        'App de Yoga, Ayurveda, Ciência e Filosofia. ' +
          'Os identificadores entre parênteses (AUTH-01, MOT-08, SEG-R05...) ' +
          'são os das regras na Matriz Técnica e no plano de desenvolvimento.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, documento));
  }

  await app.listen(process.env.PORT ?? 3100, '0.0.0.0');
}
await bootstrap();
