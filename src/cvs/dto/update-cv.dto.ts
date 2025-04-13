import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';

export class UpdateCvDto extends PartialType(CreateCvDto) {
  skills?: number[]; // Optional field for updating skills
  name?: string; // Optional field for updating name
  firstname?: string; // Optional field for updating firstname
  age?: number; // Optional field for updating age
  cin?: string; // Optional field for updating cin
  job?: string; // Optional field for updating job
  path?: string; // Optional field for updating path
  userId?: number; // Optional field for updating user
}
