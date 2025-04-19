import { Test, TestingModule } from '@nestjs/testing';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Like, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CvsService', () => {
  let service: CvsService;
  let mockCvRepository: any;
  let mockSkillRepository: any;
  let mockUserRepository: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
  };

  const adminUser = {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    isAdmin: true,
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
      findOneBy: jest.fn(),
    };

    mockUserRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        { provide: getRepositoryToken(Cv), useValue: mockCvRepository },
        { provide: getRepositoryToken(Skill), useValue: mockSkillRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a CV with user and skills', async () => {
      const createCvDto = {
        name: 'CV',
        firstname: 'Test',
        age: 30,
        cin: '12345678',
        job: 'developer',
        path: '/path/to/cv',
        skills: [1, 2],
      };

      const mockUserEntity = { id: 1, username: 'testuser' };
      const mockSkills = [
        { id: 1, designation: 'JavaScript' },
        { id: 2, designation: 'TypeScript' },
      ];

      const expectedCv = {
        ...createCvDto,
        user: mockUserEntity,
        skills: mockSkills,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUserEntity);
      mockSkillRepository.findBy.mockResolvedValue(mockSkills);
      mockCvRepository.create.mockReturnValue({ ...createCvDto });
      mockCvRepository.save.mockResolvedValue({ id: 1, ...expectedCv });

      const result = await service.create(createCvDto, mockUser);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
      });
      expect(mockSkillRepository.findBy).toHaveBeenCalledWith({
        id: In([1, 2]),
      });
      expect(mockCvRepository.create).toHaveBeenCalledWith({
        name: 'CV',
        firstname: 'Test',
        age: 30,
        cin: '12345678',
        job: 'developer',
        path: '/path/to/cv',
      });
      expect(mockCvRepository.save).toHaveBeenCalled();
      expect(result.id).toEqual(1);
      expect(result.skills).toEqual(mockSkills);
    });
  });

  describe('findAll', () => {
    it('should return all CVs for admin users', async () => {
      const expectedCvs = [{ id: 1, name: 'Test CV' }];
      mockCvRepository.find.mockResolvedValue(expectedCvs);

      const result = await service.findAll(adminUser);

      expect(mockCvRepository.find).toHaveBeenCalledWith({
        relations: ['skills', 'user'],
      });
      expect(result).toEqual(expectedCvs);
    });

    it('should return only user-owned CVs for regular users', async () => {
      const expectedCvs = [{ id: 1, name: 'User CV' }];
      mockCvRepository.find.mockResolvedValue(expectedCvs);

      const result = await service.findAll(mockUser);

      expect(mockCvRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['skills', 'user'],
      });
      expect(result).toEqual(expectedCvs);
    });
  });

  describe('findAllWithFilters', () => {
    it('should find CVs with age filter', async () => {
      const filterDto = { age: 30 };
      const expectedCvs = [{ id: 1, name: 'CV', age: 30 }];
      mockCvRepository.find.mockResolvedValue(expectedCvs);

      const result = await service.findAllWithFilters(mockUser, filterDto);

      expect(mockCvRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id }, age: 30 },
        relations: ['user'],
      });
      expect(result).toEqual(expectedCvs);
    });

    it('should find CVs with search filter', async () => {
      const filterDto = { searchValue: 'Developer' };
      const expectedCvs = [{ id: 1, name: 'Developer CV' }];
      mockCvRepository.find.mockResolvedValue(expectedCvs);

      const result = await service.findAllWithFilters(mockUser, filterDto);

      expect(mockCvRepository.find).toHaveBeenCalledWith({
        where: [
          { user: { id: mockUser.id }, name: Like('%Developer%') },
          { user: { id: mockUser.id }, firstname: Like('%Developer%') },
          { user: { id: mockUser.id }, job: Like('%Developer%') },
        ],
        relations: ['user'],
      });
      expect(result).toEqual(expectedCvs);
    });
  });

  describe('update', () => {
    it('should update a CV', async () => {
      const updateCvDto = { name: 'Updated CV' };
      const existingCv = { id: 1, name: 'Original CV' };
      const updatedCv = { id: 1, name: 'Updated CV' };

      mockCvRepository.update.mockResolvedValue({ affected: 1 });
      mockCvRepository.findOne.mockResolvedValue(updatedCv);

      const result = await service.update(1, updateCvDto);

      expect(mockCvRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated CV',
      });
      expect(mockCvRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(updatedCv);
    });

    it('should throw NotFoundException when CV not found', async () => {
      mockCvRepository.update.mockResolvedValue({ affected: 0 });
      mockCvRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Not Found' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a CV', async () => {
      const cv = { id: 1, name: 'To Be Deleted' };

      mockCvRepository.findOne.mockResolvedValue(cv);
      mockCvRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockCvRepository.findOne).toHaveBeenCalled();
      expect(mockCvRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
