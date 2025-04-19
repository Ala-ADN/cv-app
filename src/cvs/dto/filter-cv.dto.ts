import {
  IsOptional,
  IsNumber,
  IsString,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterCvDto {
  @IsOptional()
  @IsString()
  searchValue?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  age?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  withSkills?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  withUser?: boolean;
}
