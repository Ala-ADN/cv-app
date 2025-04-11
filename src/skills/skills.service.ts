import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    const skill = new Skill();
    skill.designation = createSkillDto.designation;
    skill.id = Math.floor(Math.random() * 10000);
    return skill;
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.find();
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOneBy({ id });
    if (!skill) {
      throw new Error(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const result = await this.skillRepository.update(id, updateSkillDto);
    if (result.affected === 0) {
      throw new Error(`Skill with ID ${id} not found`);
    }
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.skillRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Skill with ID ${id} not found`);
    }
  }
}
