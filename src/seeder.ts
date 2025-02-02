// src/seeder.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Book } from './books/entities/book.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Seed Users
  const userRepo = dataSource.getRepository(User);
  const adminExists = await userRepo.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash('admin_password', 10);
    const hashedUserPassword = await bcrypt.hash('user_password', 10);

    await userRepo.save([
      {
        username: 'admin_user',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        role: 'admin',
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: hashedUserPassword,
        role: 'user',
      },
    ]);

    console.log('Users seeded successfully!');
  } else {
    console.log('Users already exist, skipping user seeding.');
  }

  // Seed Books
  const bookRepo = dataSource.getRepository(Book);
  const booksExist = await bookRepo.find();

  if (booksExist.length === 0) {
    await bookRepo.save([
      { title: 'To Kill a Mockingbird', num_of_pages: 281 },
      { title: '1984', num_of_pages: 328 },
      { title: 'The Great Gatsby', num_of_pages: 180 },
      { title: 'Pride and Prejudice', num_of_pages: 279 },
      { title: 'The Catcher in the Rye', num_of_pages: 214 },
    ]);

    console.log('Books seeded successfully!');
  } else {
    console.log('Books already exist, skipping book seeding.');
  }

  await app.close();
}

bootstrap();
