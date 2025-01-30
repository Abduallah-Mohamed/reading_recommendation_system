import { UserBook } from 'src/user-books/entities/user-book.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // better for distributed systems
  id: string;

  @Column()
  name: string;

  @OneToMany(() => UserBook, (userBook) => userBook.user)
  userBooks: UserBook[];
}
