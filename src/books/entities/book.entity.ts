import { Reading } from 'src/readings/entities/reading.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  num_of_pages: number;

  @OneToMany(() => Reading, (reading) => reading.book)
  readings: Reading[];
}
