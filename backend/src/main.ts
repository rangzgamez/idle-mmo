import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://192.168.86.22:9001',
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3002);
  console.log('Server running on http://192.168.86.22:3002');
}

bootstrap(); 