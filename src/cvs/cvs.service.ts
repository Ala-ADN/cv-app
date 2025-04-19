import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { SearchCvDto } from './dto/search-cv.dto';
import { applyPagination } from '../common/pagination/pagination.helper';
import { PaginationDto } from '../common/dto/pagination.dto';

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

  async findAllWithPagination(
    user: any,
    relations?: string[],
    pagination?: PaginationDto,
  ) {
    const defaultRelations = relations || ['skills', 'user'];
  
    const qb = this.cvRepository.createQueryBuilder('cv')
      .leftJoinAndSelect('cv.skills', 'skills')
      .leftJoinAndSelect('cv.user', 'user');

    applyPagination(qb, pagination ?? new PaginationDto());
  
    if (!user.isAdmin) {
      qb.andWhere('cv.user.id = :userId', { userId: user.id });
    }
  
    return qb.getMany();
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

  async searchCvs(user: any, filter: SearchCvDto): Promise<Cv[]> {
    const query = this.cvRepository
      .createQueryBuilder('cv')
      .innerJoinAndSelect('cv.skills', 'skills')
      .innerJoinAndSelect('cv.user', 'user');
  
    // Apply search criteria
    if (filter.critere) {
      query.where(
        '(cv.name LIKE :critere OR cv.firstname LIKE :critere OR cv.job LIKE :critere)',
        { critere: `%${filter.critere}%` },
      );
    }
  
    // Apply age filter (AND with existing conditions)
    if (filter.age !== undefined) {
      if (filter.critere) {
        query.andWhere('cv.age = :age', { age: filter.age });
      } else {
        query.where('cv.age = :age', { age: filter.age });
      }
    }
  
    // Restrict to user's CVs if not admin
    if (!user.isAdmin) {
      if (filter.critere || filter.age !== undefined) {
        query.andWhere('cv.user.id = :userId', { userId: user.id });
      } else {
        query.where('cv.user.id = :userId', { userId: user.id });
      }
    }
  
    return query.getMany();
  }
  
}
