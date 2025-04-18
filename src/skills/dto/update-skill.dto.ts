import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  // No need to redefine properties as they are properly inherited from CreateSkillDto
}
