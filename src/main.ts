import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureCloudinary } from './profile/infrastructure/config/cloudinary.config';
import { GlobalExceptionFilter } from './profile/entrypoints/advice/global-exception.filter';

async function bootstrap() {
  configureCloudinary();

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));

  const config = new DocumentBuilder()
    .setTitle('Matchpuff Profile Service')
    .setDescription(
      'Microservice responsible for managing user profiles within the Matchpuff platform. ' +
        'Handles creation, update, deletion, profile image management, and user matching features.\n\n' +
        '**Authentication:** The API Gateway propagates the `X-User-Id` header ' +
        "with the authenticated user's ID. All endpoints require a valid **JWT Bearer token**.\n\n" +
        '**Internal endpoints:** Routes under `/api/v1/internal` are consumed exclusively ' +
        'by the Auth Service and Matching Service.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag(
      'Users - Creation',
      'APIs to register new users (students, admins and organizers).',
    )
    .addTag('Users - Reading', 'APIs to retrieve user and profile information.')
    .addTag(
      'Users - Update',
      'APIs to update user profile fields and settings.',
    )
    .addTag(
      'User Profiles',
      'Operations related to profile content such as image uploads and schedules.',
    )
    .addTag('Users - Deletion', 'Endpoint to permanently remove users.')
    .addTag(
      'Internal',
      'Internal-only endpoints for inter-service communication.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
