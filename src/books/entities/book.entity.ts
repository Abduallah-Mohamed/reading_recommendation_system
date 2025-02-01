import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Favorite, (favorite) => favorite.book)
  favorites: Favorite[];
}
