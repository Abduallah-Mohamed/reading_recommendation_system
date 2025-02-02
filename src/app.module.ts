import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { ReadingsModule } from './readings/readings.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Make the ConfigModule available globally
    }),
    // Configure TypeORM using environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME') || 'book_recommendation',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Automatically sync database schema (only TRUE for development)
        logging: true, // Log SQL queries
        logger: 'advanced-console',
        extra: {
          connectionLog: () => {
            console.log('Connection logged');
          },
        },
      }),
      inject: [ConfigService],
    }),
    BooksModule,
    AuthModule,
    ReadingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
