import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cv } from '../../cvs/entities/cv.entity';

export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  @OneToMany(() => Cv, (cv) => cv.user, { cascade: true })
  cvs: Cv[];
}
