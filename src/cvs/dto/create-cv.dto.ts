import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCvDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Firstname is required' })
  @IsString()
  firstname: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber({}, { message: 'Age must be a number' })
  age: number;

  @IsNotEmpty({ message: 'CIN is required' })
  @IsString()
  cin: string;

  @IsNotEmpty({ message: 'Job is required' })
  @IsString()
  job: string;

  @IsNotEmpty({ message: 'Path is required' })
  @IsString()
  path: string;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  skills?: number[];

  @IsOptional()
  @IsInt({ message: 'User ID must be an integer' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  userId?: number;
}
