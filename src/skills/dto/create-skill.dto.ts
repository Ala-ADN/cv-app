import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSkillDto {
  @IsNotEmpty({ message: 'Designation is required' })
  @IsString({ message: 'Designation must be a string' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  designation: string;
}
