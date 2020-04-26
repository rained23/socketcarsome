import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['carId', 'price'])
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  carId: number;

  @Column()
  user: string;

  @Column()
  price: number;
}
