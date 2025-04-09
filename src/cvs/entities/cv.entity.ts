import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
@Entity()
export class Cv {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  firstname: string;
  @Column()
  age: number;
  @Column()
  cin: string;
  @Column()
  job: string;
  @Column()
  path: string;
  @ManyToMany(() => Cv, (cv) => cv.skills, { cascade: true })
  @JoinTable()
  skills: Skill[];
  @ManyToOne(() => User, (user) => user.cvs, { cascade: true })
  user: User;
}
