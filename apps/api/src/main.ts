import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  await app.listen(process.env.PORT ?? 3100, '0.0.0.0');
}
await bootstrap();
