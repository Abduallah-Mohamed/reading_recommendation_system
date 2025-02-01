import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Set global prefix
  app.setGlobalPrefix('api/v1');

  // ✅ Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties not defined in DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // ✅ Swagger Configuration (AFTER global prefix)
  const config = new DocumentBuilder()
    .setTitle('Book Recommendation API')
    .setDescription('API documentation for the Book Recommendation System')
    .setVersion('1.0')
    // .addBearerAuth() // 🔑 Enables JWT Authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Will be available at `/api/v1/docs`

  // ✅ Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ Start the server
  await app.listen(process.env.PORT || 3000);
  Logger.log(
    `🚀 Server running at http://localhost:${process.env.PORT || 3000}`,
  );
  Logger.log(
    `📚 Swagger Docs at http://localhost:${process.env.PORT || 3000}/api/docs`,
  );
}
bootstrap();
