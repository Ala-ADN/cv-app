import { Test, TestingModule } from '@nestjs/testing';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CvsService', () => {
  let service: CvsService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };
  const mockSkillRepository = {
    findBy: jest.fn(),
    findOneBy: jest.fn(),
  };
  const mockCvRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),  
      orWhere: jest.fn().mockReturnThis(),  
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    isAdmin: false,
  };
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(), 
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };
  
  mockCvRepository.createQueryBuilder.mockImplementation(() => mockQueryBuilder);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        { provide: getRepositoryToken(Cv), useValue: mockCvRepository },
        { provide: getRepositoryToken(Skill), useValue: mockSkillRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a CV', async () => {
      const createCvDto = {
        name: 'CV',
        firstname: 'Test',
        age: 30,
        cin: '12345678',
        job: 'dev',
        path: '/some/path',
        skills: [1, 2],
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockSkillRepository.findBy.mockResolvedValue([]);
      mockCvRepository.create.mockReturnValue({ ...createCvDto });
      mockCvRepository.save.mockResolvedValue({ id: 1, ...createCvDto });
      const result = await service.create(createCvDto, mockUser);
      expect(result).toEqual({ id: 1, ...createCvDto });
    });
  });

  describe('create (no skills)', () => {
    it('should create a CV without skills', async () => {
      const createCvDto = {
        name: 'CV2',
        firstname: 'Test2',
        age: 31,
        cin: '87654321',
        job: 'designer',
        path: '/another/path',
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockCvRepository.create.mockReturnValue({ ...createCvDto });
      mockCvRepository.save.mockResolvedValue({ id: 2, ...createCvDto });
      const result = await service.create(createCvDto, mockUser);
      expect(result).toEqual({ id: 2, ...createCvDto });
    });
  });

  describe('findAll', () => {
    it('should find all CVs (admin)', async () => {
      const adminUser = { ...mockUser, isAdmin: true };
      mockCvRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll(adminUser);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should find all CVs for user', async () => {
      mockCvRepository.find.mockResolvedValue([{ id: 2 }]);
      const result = await service.findAll(mockUser);
      expect(result).toEqual([{ id: 2 }]);
    });
  });


  // Example for further usage, to show how args should be provided
  describe('other methods', () => {
    it('should call create with both arguments', async () => {
      const createCvDto = {
        name: 'CV',
        firstname: 'Test',
        age: 30,
        cin: '12345678',
        job: 'dev',
        path: '/some/path',
        skills: [1, 2],
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockCvRepository.create.mockReturnValue({ ...createCvDto });
      mockCvRepository.save.mockResolvedValue({ id: 3, ...createCvDto });
      await service.create(createCvDto, mockUser); // should not throw
      expect(mockCvRepository.save).toHaveBeenCalled();
    });

    it('should call findAll with mock user', async () => {
      mockCvRepository.find.mockResolvedValue([{ id: 5 }]);
      await service.findAll(mockUser);
      expect(mockCvRepository.find).toHaveBeenCalled();
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
  

  describe('searchCvs', () => {
    it('should filter CVs by user if not admin', async () => {
      const filter = { critere: 'dev' };
      const regularUser = { ...mockUser, isAdmin: false };
    
      await service.searchCvs(regularUser, filter);
    
      // Check search criteria
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(cv.name LIKE :critere OR cv.firstname LIKE :critere OR cv.job LIKE :critere)',
        { critere: '%dev%' }
      );
    
      // Check user restriction
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'cv.user.id = :userId',
        { userId: regularUser.id }
      );
    });
    
    it('should not apply user filter if admin', async () => {
      const filter = { critere: 'design' };
      const adminUser = { ...mockUser, isAdmin: true };
    
      await service.searchCvs(adminUser, filter);
    
      // Check search criteria
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(cv.name LIKE :critere OR cv.firstname LIKE :critere OR cv.job LIKE :critere)',
        { critere: '%design%' }
      );
    
      // Ensure no user filter
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        'cv.user.id = :userId',
        expect.anything()
      );
    });
  });
  

});
