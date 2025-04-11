import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  designation: string;
}
