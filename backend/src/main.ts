import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Register helmet security headers middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));

  // Dynamic CORS origin configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ].filter((origin): origin is string => !!origin);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Set global API prefix, excluding the health endpoint for Railway/docker checks
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Set global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Backend server running on: http://localhost:${port}/api`);
}
bootstrap();
