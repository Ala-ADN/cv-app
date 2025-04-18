import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Cv } from '../cvs/entities/cv.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @InjectRepository(Cv) private cvRepository: Repository<Cv>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    const skill = this.skillRepository.create(createSkillDto);
    return this.skillRepository.save(skill);
  }

  findAll(withCvs: boolean = false) {
    if (withCvs) {
      return this.skillRepository.find({
        relations: ['cvs'],
      });
    }
    return this.skillRepository.find();
  }

  async findOne(id: number, withCvs: boolean = false) {
    let skill;

    if (withCvs) {
      skill = await this.skillRepository.findOne({
        where: { id },
        relations: ['cvs'],
      });
    } else {
      skill = await this.skillRepository.findOneBy({ id });
    }

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  async findPopularSkills(limit: number = 5) {
    // Find skills used in the most CVs
    return this.skillRepository
      .createQueryBuilder('skill')
      .leftJoin('cv_skills_skill', 'cv_skill', 'cv_skill.skillId = skill.id')
      .select('skill.id', 'id')
      .addSelect('skill.designation', 'designation')
      .addSelect('COUNT(cv_skill.cvId)', 'count')
      .groupBy('skill.id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async findByCv(cvId: number) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId },
      relations: ['skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }

    return cv.skills;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const updateResult = await this.skillRepository.update(id, updateSkillDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const skill = await this.findOne(id);
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    // TypeORM will handle removing the skill from the join table
    const result = await this.skillRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return { deleted: true };
  }
}
