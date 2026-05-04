import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ Credential: true });
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();
