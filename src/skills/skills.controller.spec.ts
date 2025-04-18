import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Cv } from '../cvs/entities/cv.entity';

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: SkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
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

    controller = module.get<SkillsController>(SkillsController);
    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of skills without CVs', async () => {
      const skills = [
        { id: 1, designation: 'JavaScript', cvs: [] },
        { id: 2, designation: 'TypeScript', cvs: [] },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(skills);

      expect(await controller.findAll()).toBe(skills);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should return an array of skills with CVs', async () => {
      const skills = [
        { id: 1, designation: 'JavaScript', cvs: [] },
        { id: 2, designation: 'TypeScript', cvs: [] },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(skills);

      expect(await controller.findAll('true')).toBe(skills);
      expect(service.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return a skill by id without CVs', async () => {
      const skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(service, 'findOne').mockResolvedValue(skill);

      expect(await controller.findOne(1)).toBe(skill);
      expect(service.findOne).toHaveBeenCalledWith(1, false);
    });

    it('should return a skill by id with CVs', async () => {
      const skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(service, 'findOne').mockResolvedValue(skill);

      expect(await controller.findOne(1, 'true')).toBe(skill);
      expect(service.findOne).toHaveBeenCalledWith(1, true);
    });
  });

  describe('findPopularSkills', () => {
    it('should return the most popular skills', async () => {
      const popularSkills = [
        { id: 1, designation: 'JavaScript', count: '5' },
        { id: 2, designation: 'TypeScript', count: '3' },
      ];
      jest.spyOn(service, 'findPopularSkills').mockResolvedValue(popularSkills);

      expect(await controller.findPopularSkills('2')).toBe(popularSkills);
      expect(service.findPopularSkills).toHaveBeenCalledWith(2);
    });
  });

  describe('findByCv', () => {
    it('should return skills by CV ID', async () => {
      const skills = [
        { id: 1, designation: 'JavaScript', cvs: [] },
        { id: 2, designation: 'TypeScript', cvs: [] },
      ];
      jest.spyOn(service, 'findByCv').mockResolvedValue(skills);

      expect(await controller.findByCv(1)).toBe(skills);
      expect(service.findByCv).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new skill', async () => {
      const createSkillDto = { designation: 'JavaScript' };
      const skill = { id: 1, designation: 'JavaScript', cvs: [] };
      jest.spyOn(service, 'create').mockResolvedValue(skill);

      expect(await controller.create(createSkillDto)).toBe(skill);
      expect(service.create).toHaveBeenCalledWith(createSkillDto);
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const updateSkillDto = { designation: 'Updated Skill' };
      const skill = { id: 1, designation: 'Updated Skill', cvs: [] };
      jest.spyOn(service, 'update').mockResolvedValue(skill);

      expect(await controller.update(1, updateSkillDto)).toBe(skill);
      expect(service.update).toHaveBeenCalledWith(1, updateSkillDto);
    });
  });

  describe('remove', () => {
    it('should remove a skill', async () => {
      const result = { deleted: true };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
