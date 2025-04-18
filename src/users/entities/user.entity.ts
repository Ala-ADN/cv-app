import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';
import { Cv } from '../../cvs/entities/cv.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  username: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column()
  salt: string;
  @Column({ default: "user" })
  role:string;
  @OneToMany(() => Cv, (cv) => cv.user, { cascade: true })
  cvs: Cv[];
}
