import { Test, TestingModule } from '@nestjs/testing';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CvsService', () => {
  let service: CvsService;
  let mockCvRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let mockSkillRepository: {
    findBy: jest.Mock;
  };
  let mockUserRepository: {
    findOneBy: jest.Mock;
  };

  beforeEach(async () => {
    mockCvRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockSkillRepository = {
      findBy: jest.fn(),
    };

    mockUserRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        {
          provide: getRepositoryToken(Cv),
          useValue: mockCvRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a CV with skills and return it', async () => {
      const createCvDto = {
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [1, 2],
      };

      const cvData = {
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
      };

      const mockSkills = [
        { id: 1, designation: 'JavaScript' },
        { id: 2, designation: 'TypeScript' },
      ];

      const mockCv = {
        id: 1,
        ...cvData,
        skills: [],
      };

      const savedCv = {
        id: 1,
        ...cvData,
        skills: mockSkills,
      };

      mockCvRepository.create.mockReturnValue(mockCv);
      mockSkillRepository.findBy.mockResolvedValue(mockSkills);
      mockCvRepository.save.mockResolvedValue(savedCv);

      const result = await service.create(createCvDto);

      expect(mockCvRepository.create).toHaveBeenCalledWith(cvData);
      expect(mockSkillRepository.findBy).toHaveBeenCalledWith({
        id: In([1, 2]),
      });
      expect(mockCvRepository.save).toHaveBeenCalledWith({
        ...mockCv,
        skills: mockSkills,
      });
      expect(result).toEqual(savedCv);
    });

    it('should create a CV without skills', async () => {
      const createCvDto = {
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
      };

      const mockCv = {
        id: 1,
        ...createCvDto,
        skills: [],
      };

      mockCvRepository.create.mockReturnValue(mockCv);
      mockCvRepository.save.mockResolvedValue(mockCv);

      const result = await service.create(createCvDto);

      expect(mockCvRepository.create).toHaveBeenCalledWith(createCvDto);
      expect(mockSkillRepository.findBy).not.toHaveBeenCalled();
      expect(mockCvRepository.save).toHaveBeenCalledWith(mockCv);
      expect(result).toEqual(mockCv);
    });
  });

  describe('findAll', () => {
    it('should return an array of CVs with their skills and user relationships', async () => {
      const cvs = [
        { id: 1, name: 'CV 1', skills: [], user: null },
        { id: 2, name: 'CV 2', skills: [], user: null },
      ];

      mockCvRepository.find.mockResolvedValue(cvs);

      const result = await service.findAll();

      expect(mockCvRepository.find).toHaveBeenCalledWith({
        relations: ['skills', 'user'],
      });
      expect(result).toEqual(cvs);
    });
  });

  describe('findOne', () => {
    it('should return a CV by id with its skills and user', async () => {
      const cv = {
        id: 1,
        name: 'Test CV',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: null,
      };

      mockCvRepository.findOne.mockResolvedValue(cv);

      const result = await service.findOne(1);

      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['skills', 'user'],
      });
      expect(result).toEqual(cv);
    });
  });

  describe('update', () => {
    it('should update a CV including its skills', async () => {
      const updateCvDto = {
        name: 'Updated CV',
        skills: [1, 3],
      };

      const existingCv = {
        id: 1,
        name: 'Original CV',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [{ id: 1, designation: 'JavaScript' }],
        user: null,
      };

      const updatedCv = {
        ...existingCv,
        name: 'Updated CV',
        skills: [
          { id: 1, designation: 'JavaScript' },
          { id: 3, designation: 'Node.js' },
        ],
      };

      const updatedSkills = [
        { id: 1, designation: 'JavaScript' },
        { id: 3, designation: 'Node.js' },
      ];

      mockCvRepository.update.mockResolvedValue({ affected: 1 });
      mockCvRepository.findOne.mockResolvedValueOnce(existingCv);
      mockSkillRepository.findBy.mockResolvedValue(updatedSkills);
      mockCvRepository.save.mockResolvedValue(updatedCv);

      const result = await service.update(1, updateCvDto);

      expect(mockCvRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated CV',
      });
      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['skills', 'user'],
      });
      expect(mockSkillRepository.findBy).toHaveBeenCalledWith({
        id: In([1, 3]),
      });
      expect(mockCvRepository.save).toHaveBeenCalledWith({
        ...existingCv,
        skills: updatedSkills,
      });
      expect(result).toEqual(updatedCv);
    });

    it('should update a CV without updating skills', async () => {
      const updateCvDto = {
        name: 'Updated CV',
      };

      const existingCv = {
        id: 1,
        name: 'Original CV',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [{ id: 1, designation: 'JavaScript' }],
        user: null,
      };

      const updatedCv = {
        ...existingCv,
        name: 'Updated CV',
      };

      mockCvRepository.update.mockResolvedValue({ affected: 1 });
      mockCvRepository.findOne.mockResolvedValue(updatedCv);

      const result = await service.update(1, updateCvDto);

      expect(mockCvRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated CV',
      });
      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['skills', 'user'],
      });
      expect(mockSkillRepository.findBy).not.toHaveBeenCalled();
      // We should not expect save to be called when there are no skills in the update
      expect(mockCvRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(updatedCv);
    });

    it('should throw a NotFoundException if CV is not found', async () => {
      mockCvRepository.update.mockResolvedValue({ affected: 0 });
      mockCvRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated CV' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, { name: 'Updated CV' })).rejects.toThrow(
        'CV with ID 999 not found',
      );

      expect(mockCvRepository.update).toHaveBeenCalledWith(999, {
        name: 'Updated CV',
      });
      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['skills', 'user'],
      });
    });
  });

  describe('remove', () => {
    it('should delete a CV and return success status', async () => {
      const existingCv = {
        id: 1,
        name: 'Test CV',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: null,
      };

      mockCvRepository.findOne.mockResolvedValue(existingCv);
      mockCvRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['skills', 'user'],
      });
      expect(mockCvRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when CV does not exist', async () => {
      mockCvRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'CV with ID 999 not found',
      );

      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['skills', 'user'],
      });
      expect(mockCvRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete operation fails', async () => {
      const existingCv = {
        id: 1,
        name: 'Test CV',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: null,
      };

      mockCvRepository.findOne.mockResolvedValue(existingCv);
      mockCvRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(1)).rejects.toThrow('CV with ID 1 not found');

      expect(mockCvRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['skills', 'user'],
      });
      expect(mockCvRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
