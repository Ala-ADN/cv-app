import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Cv } from '../cvs/entities/cv.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;
  let skillRepository: Repository<Skill>;
  let cvRepository: Repository<Cv>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Cv),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));
    cvRepository = module.get<Repository<Cv>>(getRepositoryToken(Cv));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a skill', async () => {
      const createSkillDto = { designation: 'JavaScript' };
      const newSkill = { id: 1, designation: 'JavaScript', cvs: [] };

      jest.spyOn(skillRepository, 'create').mockReturnValue(newSkill);
      jest.spyOn(skillRepository, 'save').mockResolvedValue(newSkill);

      const result = await service.create(createSkillDto);

      expect(skillRepository.create).toHaveBeenCalledWith(createSkillDto);
      expect(skillRepository.save).toHaveBeenCalledWith(newSkill);
      expect(result).toEqual(newSkill);
    });
  });

  describe('findAll', () => {
    it('should return an array of skills', async () => {
      const skills: Skill[] = [{ id: 1, designation: 'JavaScript', cvs: [] }];
      jest.spyOn(skillRepository, 'find').mockResolvedValue(skills);

      const result = await service.findAll();
      expect(result).toEqual(skills);
    });
  });

  describe('findOne', () => {
    it('should return a skill by ID', async () => {
      const skill: Skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(skill);

      const result = await service.findOne(1);
      expect(result).toEqual(skill);
    });

    it('should throw an error if skill not found', async () => {
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        'Skill with ID 1 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const updateSkillDto = { designation: 'TypeScript' };
      const skill: Skill = { id: 1, designation: 'JavaScript', cvs: [] };
      const updatedSkill: Skill = { id: 1, designation: 'TypeScript', cvs: [] };

      jest
        .spyOn(skillRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(updatedSkill);

      const result = await service.update(1, updateSkillDto);
      expect(result).toEqual(updatedSkill);
    });

    it('should throw an error if skill not found', async () => {
      jest
        .spyOn(skillRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.update(1, { designation: 'TypeScript' }),
      ).rejects.toThrow('Skill with ID 1 not found');
    });
  });

  describe('remove', () => {
    it('should remove a skill', async () => {
      const skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(skill);
      jest
        .spyOn(skillRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(skillRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when skill does not exist', async () => {
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Skill with ID 999 not found',
      );

      expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(skillRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete operation fails', async () => {
      const skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(skillRepository, 'findOneBy').mockResolvedValue(skill);
      jest
        .spyOn(skillRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(1)).rejects.toThrow(
        'Skill with ID 1 not found',
      );

      expect(skillRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(skillRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
