import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CvsService {
  constructor(
    @InjectRepository(Cv) private cvRepository: Repository<Cv>,
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(data: CreateCvDto) {
    const { skills: skillIds, userId, ...cvData } = data;
    const cv = this.cvRepository.create(cvData);

    if (skillIds) {
      const skills = await this.skillRepository.findBy({ id: In(skillIds) });
      cv.skills = skills;
    }

    if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      cv.user = user;
    }

    return this.cvRepository.save(cv);
  }

  findAll(relations?: string[]) {
    return this.cvRepository.find({
      relations: relations || ['skills', 'user'],
    });
  }

  findOne(id: number, relations?: string[]) {
    return this.cvRepository.findOne({
      where: { id },
      relations: relations || ['skills', 'user'],
    });
  }

  async findByUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.cvRepository.find({
      where: { user: { id: userId } },
      relations: ['skills', 'user'],
    });
  }

  async findBySkill(skillId: number) {
    const skill = await this.skillRepository.findOneBy({ id: skillId });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    return this.cvRepository
      .createQueryBuilder('cv')
      .innerJoinAndSelect('cv.skills', 'skill')
      .innerJoinAndSelect('cv.user', 'user')
      .where('skill.id = :skillId', { skillId })
      .getMany();
  }

  async update(id: number, data: UpdateCvDto) {
    const { skills: skillIds, userId, ...cvData } = data;

    // Update basic CV properties
    const updateResult = await this.cvRepository.update(id, cvData);

    // Get the updated CV
    const cv = await this.findOne(id);

    if (!cv || updateResult.affected === 0) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    let shouldSave = false;

    // Update skills if provided
    if (skillIds && skillIds.length > 0) {
      const skills = await this.skillRepository.findBy({ id: In(skillIds) });
      cv.skills = skills;
      shouldSave = true;
    }

    // Update user if provided
    if (userId !== undefined) {
      const user = userId
        ? await this.userRepository.findOneBy({ id: userId })
        : null;
      if (userId && !user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      cv.user = user;
      shouldSave = true;
    }

    // Only save if skills or user were updated
    if (shouldSave) {
      return this.cvRepository.save(cv);
    }

    return cv;
  }

  async updateSkills(id: number, skillIds: number[]) {
    const cv = await this.findOne(id);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    const skills = await this.skillRepository.findBy({ id: In(skillIds) });
    cv.skills = skills;

    return this.cvRepository.save(cv);
  }

  async assignToUser(cvId: number, userId: number) {
    const cv = await this.findOne(cvId);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    cv.user = user;
    return this.cvRepository.save(cv);
  }

  async removeSkill(cvId: number, skillId: number) {
    const cv = await this.findOne(cvId);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }

    if (!cv.skills) {
      throw new NotFoundException(`CV with ID ${cvId} has no skills`);
    }

    cv.skills = cv.skills.filter((skill) => skill.id !== skillId);
    return this.cvRepository.save(cv);
  }

  async remove(id: number) {
    const cv = await this.findOne(id);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    const result = await this.cvRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    return { deleted: true };
  }
}
