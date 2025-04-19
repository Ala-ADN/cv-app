import { Test, TestingModule } from '@nestjs/testing';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilterCvDto } from './dto/filter-cv.dto';

describe('CvsController', () => {
  let controller: CvsController;
  let service: CvsService;

  const mockUser = {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    isAdmin: false,
  };

  // Simple mock of the service
  const mockCvsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllWithFilters: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByUser: jest.fn(),
    findBySkill: jest.fn(),
    updateSkills: jest.fn(),
    assignToUser: jest.fn(),
    removeSkill: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvsController],
      providers: [
        // Use a simple mock service instead of creating full repository mocks
        {
          provide: CvsService,
          useValue: mockCvsService,
        },
      ],
    }).compile();

    controller = module.get<CvsController>(CvsController);
    service = module.get<CvsService>(CvsService);

    // Reset mock counts between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a CV', async () => {
      const createCvDto: CreateCvDto = {
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [1, 2],
      };

      const expectedCv = { id: 1, ...createCvDto, skills: [] };
      mockCvsService.create.mockResolvedValue(expectedCv);

      const result = await controller.create(createCvDto, mockUser);

      expect(mockCvsService.create).toHaveBeenCalledWith(createCvDto, mockUser);
      expect(result).toEqual(expectedCv);
    });
  });

  describe('findAll', () => {
    it('should return all CVs without filters', async () => {
      const expectedCvs = [{ id: 1, name: 'John CV' }];
      mockCvsService.findAll.mockResolvedValue(expectedCvs);

      const result = await controller.findAll(mockUser, new FilterCvDto());

      expect(mockCvsService.findAll).toHaveBeenCalledWith(mockUser, []);
      expect(result).toEqual(expectedCvs);
    });

    it('should return all CVs with relations', async () => {
      const expectedCvs = [{ id: 1, name: 'John CV', skills: [], user: {} }];
      mockCvsService.findAll.mockResolvedValue(expectedCvs);

      const filterDto = new FilterCvDto();
      filterDto.withSkills = true;
      filterDto.withUser = true;

      const result = await controller.findAll(mockUser, filterDto);

      expect(mockCvsService.findAll).toHaveBeenCalledWith(mockUser, [
        'skills',
        'user',
      ]);
      expect(result).toEqual(expectedCvs);
    });

    it('should use findAllWithFilters when search parameters are provided', async () => {
      const expectedCvs = [{ id: 1, name: 'John Developer' }];
      mockCvsService.findAllWithFilters.mockResolvedValue(expectedCvs);

      const filterDto = new FilterCvDto();
      filterDto.searchValue = 'Developer';

      const result = await controller.findAll(mockUser, filterDto);

      expect(mockCvsService.findAllWithFilters).toHaveBeenCalledWith(
        mockUser,
        filterDto,
        [],
      );
      expect(result).toEqual(expectedCvs);
    });
  });

  describe('findOne', () => {
    it('should return a CV by ID', async () => {
      const expectedCv = { id: 1, name: 'John CV' };
      mockCvsService.findOne.mockResolvedValue(expectedCv);

      const result = await controller.findOne('1', new FilterCvDto());

      expect(mockCvsService.findOne).toHaveBeenCalledWith(1, []);
      expect(result).toEqual(expectedCv);
    });
  });

  describe('update', () => {
    it('should update a CV', async () => {
      const updateCvDto: UpdateCvDto = { name: 'Updated CV' };
      const expectedCv = { id: 1, name: 'Updated CV' };
      mockCvsService.update.mockResolvedValue(expectedCv);

      const result = await controller.update('1', updateCvDto);

      expect(mockCvsService.update).toHaveBeenCalledWith(1, updateCvDto);
      expect(result).toEqual(expectedCv);
    });
  });

  describe('remove', () => {
    it('should remove a CV', async () => {
      const deleteResult = { deleted: true };
      mockCvsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('1');

      expect(mockCvsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
