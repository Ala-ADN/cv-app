import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOptionsWhere } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilterCvDto } from './dto/filter-cv.dto';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CvsService {
  constructor(
    @InjectRepository(Cv) private cvRepository: Repository<Cv>,
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(data: CreateCvDto, user: any) {
    const { skills: skillIds, ...cvData } = data;
    const cv = this.cvRepository.create(cvData);

    const userEntity = await this.userRepository.findOneBy({ id: user.id });
    if (!userEntity) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }
    cv.user = userEntity;

    if (skillIds) {
      const skills = await this.skillRepository.findBy({ id: In(skillIds) });
      cv.skills = skills;
    }

    return this.cvRepository.save(cv);
  }

  async findAll(user: any, relations?: string[]) {
    const defaultRelations = relations || ['skills', 'user'];

    if (user.isAdmin) {
      return this.cvRepository.find({ relations: defaultRelations });
    } else {
      return this.cvRepository.find({
        where: { user: { id: user.id } },
        relations: defaultRelations,
      });
    }
  }

  async findAllWithFilters(
    user: any,
    filterDto: FilterCvDto,
    relations?: string[],
  ) {
    // Prepare relations
    const relationsToInclude = [...(relations || [])];
    if (filterDto.withSkills && !relationsToInclude.includes('skills')) {
      relationsToInclude.push('skills');
    }
    if (filterDto.withUser && !relationsToInclude.includes('user')) {
      relationsToInclude.push('user');
    }
    if (!relationsToInclude.includes('user')) {
      relationsToInclude.push('user');
    }

    // Base where condition
    let where: any = {};

    // Apply user-based filtering
    if (!user.isAdmin) {
      where.user = { id: user.id };
    }

    const { searchValue, age } = filterDto;

    // Apply age filter if provided
    if (age !== undefined) {
      where.age = age;
    }

    // For search value, we need to use multiple conditions with OR logic
    if (searchValue) {
      // Create an array of OR conditions
      const searchConditions = [
        { ...where, name: Like(`%${searchValue}%`) },
        { ...where, firstname: Like(`%${searchValue}%`) },
        { ...where, job: Like(`%${searchValue}%`) },
      ];

      // Use the search conditions directly
      return this.cvRepository.find({
        where: searchConditions,
        relations: relationsToInclude,
      });
    }

    // Standard query without search
    return this.cvRepository.find({
      where,
      relations: relationsToInclude,
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
