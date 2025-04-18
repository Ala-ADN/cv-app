import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Inherits username, email, password from CreateUserDto with validations

  @IsOptional()
  @IsArray({ message: 'CVs must be an array' })
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
  cvs?: number[]; // Array of CV IDs to update the user's CVs
}
