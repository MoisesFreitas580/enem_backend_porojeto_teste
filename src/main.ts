import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  const port = Number(process.env.PORT) || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //remove campos não declarados no DTO
      transform: true, //transforma query string em number etc.
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new BigIntInterceptor());

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('ENEM API')
    .setDescription('Documentação da API (inclui catálogo público)')
    .setVersion('1.0')
    .addTag('Catalog')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`API rodando na porta ${port}`);
}
bootstrap();
