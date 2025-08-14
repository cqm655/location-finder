import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5174',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  await app.listen(3003);
}

bootstrap();
