import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Cv } from '../../cvs/entities/cv.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'Designation cannot be empty' })
  @IsString({ message: 'Designation must be a string' })
  @MinLength(2, { message: 'Designation must be at least 2 characters' })
  @MaxLength(50, { message: 'Designation cannot exceed 50 characters' })
  designation: string;

  @ManyToMany(() => Cv, (cv) => cv.skills)
  cvs: Cv[];
}
