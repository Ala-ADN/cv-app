import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';
import { IsOptional } from 'class-validator';

// UpdateCvDto inherits all validations and transformations from CreateCvDto
// and makes all properties optional through PartialType
export class UpdateCvDto extends PartialType(CreateCvDto) {
  // No need to redefine properties as they're inherited from CreateCvDto
  // with all validations and transformations, and made optional by PartialType
}
