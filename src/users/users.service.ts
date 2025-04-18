import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cv } from '../cvs/entities/cv.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cv) private cvRepository: Repository<Cv>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(withCvs: boolean = false) {
    if (withCvs) {
      return this.userRepository.find({
        relations: ['cvs'],
      });
    }
    return this.userRepository.find();
  }

  findOne(id: number, withCvs: boolean = false) {
    if (withCvs) {
      return this.userRepository.findOne({
        where: { id },
        relations: ['cvs'],
      });
    }
    return this.userRepository.findOneBy({ id });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['cvs'],
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['cvs'],
    });
  }

  async findUserCvs(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cvs', 'cvs.skills'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.cvs;
  }

  async findUsersWithMostCvs(limit: number = 5) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.cvs', 'cv')
      .select('user.id', 'id')
      .addSelect('user.username', 'username')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(cv.id)', 'cvCount')
      .groupBy('user.id')
      .orderBy('cvCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Extract cvs array if it exists
    const { cvs, ...userData } = updateUserDto;

    // Update basic user properties
    const updateResult = await this.userRepository.update(id, userData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If cvs array was provided, update the user's cvs relationship
    if (cvs && cvs.length > 0) {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['cvs'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Get CV entities by IDs
      const cvEntities = await this.cvRepository.findBy({ id: In(cvs) });

      // Update each CV to set this user
      for (const cv of cvEntities) {
        cv.user = user;
        await this.cvRepository.save(cv);
      }
    }

    return this.findOne(id, true);
  }

  async remove(id: number) {
    const user = await this.findOne(id, true);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If user has CVs, we need to handle them according to the business logic
    // Option 1: Cascade delete (already configured in entity)
    // Option 2: Detach CVs from user
    // Here we'll use the cascade delete configured in the entity

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { deleted: true };
  }

  async removeCvFromUser(userId: number, cvId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cvs'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const cv = await this.cvRepository.findOneBy({ id: cvId });
    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }

    // Check if the CV belongs to this user
    const cvBelongsToUser = user.cvs.some((userCv) => userCv.id === cvId);
    if (!cvBelongsToUser) {
      throw new NotFoundException(
        `CV with ID ${cvId} does not belong to User with ID ${userId}`,
      );
    }

    // Update the CV to remove the user reference
    cv.user = null;
    await this.cvRepository.save(cv);

    return { success: true };
  }
}
