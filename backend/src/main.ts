import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // connectToShare();

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type, Accept', 'Authorization'],
  });
  await app.listen(3004);
}

bootstrap();
