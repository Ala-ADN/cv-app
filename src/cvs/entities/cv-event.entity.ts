import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Cv } from '../../cvs/entities/cv.entity';
import { User } from '../../users/entities/user.entity';

export enum CvEventType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity()
export class CvEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: CvEventType })
  type: CvEventType;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => Cv, { eager: true })
  cv: Cv;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ nullable: true })
  details: string;
}
