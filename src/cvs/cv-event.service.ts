import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvEvent, CvEventType } from './entities/cv-event.entity';
import { Cv } from './entities/cv.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CvEventService {
  constructor(
    @InjectRepository(CvEvent)
    private readonly cvEventRepository: Repository<CvEvent>,
  ) {}

  async logEvent(type: CvEventType, cv: Cv, user: User, details?: string) {
    const event = this.cvEventRepository.create({ type, cv, user, details });
    return this.cvEventRepository.save(event);
  }

  async findAll() {
    return this.cvEventRepository.find({ relations: ['cv', 'user'] });
  }

  async findByCv(cvId: number) {
    return this.cvEventRepository.find({ where: { cv: { id: cvId } }, relations: ['cv', 'user'] });
  }
}

export { CvEventType };
