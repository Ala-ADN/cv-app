import { Test, TestingModule } from '@nestjs/testing';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

describe('CvsController', () => {
  let controller: CvsController;
  let service: CvsService;

  const mockSkills: Skill[] = [
    { id: 1, designation: 'JavaScript', cvs: [] },
    { id: 2, designation: 'TypeScript', cvs: [] },
    { id: 3, designation: 'Python', cvs: [] },
  ];

  const mockUser: User = {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    password: 'password123',
    cvs: [],
    role: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvsController],
      providers: [
        CvsService,
        {
          provide: getRepositoryToken(Cv),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            findBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CvsController>(CvsController);
    service = module.get<CvsService>(CvsService);
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

      const expectedResult: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: mockSkills.slice(0, 2),
        user: null,
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createCvDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createCvDto, mockUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all CVs without relations', async () => {
      const cvs: Cv[] = [
        {
          id: 1,
          name: 'John Doe',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Developer',
          path: '/path/to/cv',
          skills: [],
          user: null,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(cvs);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(cvs);
    });

    it('should return all CVs with skills and user', async () => {
      const cvs: Cv[] = [
        {
          id: 1,
          name: 'John Doe',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Developer',
          path: '/path/to/cv',
          skills: mockSkills.slice(0, 1),
          user: mockUser,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(cvs);

      const result = await controller.findAll(mockUser, 'true', 'true');

      expect(service.findAll).toHaveBeenCalledWith(mockUser, [
        'skills',
        'user',
      ]);
      expect(result).toEqual(cvs);
    });
  });

  describe('findOne', () => {
    it('should return a CV by id', async () => {
      const cv: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: null,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(cv);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(cv);
    });

    it('should return a CV by id with skills and user', async () => {
      const cv: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: mockSkills.slice(0, 1),
        user: mockUser,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(cv);

      const result = await controller.findOne('1', 'true', 'true');

      expect(service.findOne).toHaveBeenCalledWith(1, ['skills', 'user']);
      expect(result).toEqual(cv);
    });
  });

  describe('update', () => {
    it('should update a CV', async () => {
      const updateCvDto: UpdateCvDto = {
        name: 'Updated Name',
        skills: [1, 2, 3],
      };

      const updatedCv: Cv = {
        id: 1,
        name: 'Updated Name',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: mockSkills,
        user: null,
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedCv);

      const result = await controller.update('1', updateCvDto);

      expect(service.update).toHaveBeenCalledWith(1, updateCvDto);
      expect(result).toEqual(updatedCv);
    });
  });

  describe('updateSkills', () => {
    it('should update CV skills', async () => {
      const skillIds = { skillIds: [1, 2] };
      const updatedCv: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: mockSkills.slice(0, 2),
        user: null,
      };

      jest.spyOn(service, 'updateSkills').mockResolvedValue(updatedCv);

      const result = await controller.updateSkills('1', skillIds);

      expect(service.updateSkills).toHaveBeenCalledWith(1, skillIds.skillIds);
      expect(result).toEqual(updatedCv);
    });
  });

  describe('assignToUser', () => {
    it('should assign a CV to a user', async () => {
      const updatedCv: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: mockUser,
      };

      jest.spyOn(service, 'assignToUser').mockResolvedValue(updatedCv);

      const result = await controller.assignToUser(1, 1);

      expect(service.assignToUser).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(updatedCv);
    });
  });

  describe('remove', () => {
    it('should remove a CV', async () => {
      const deleteResult = { deleted: true };

      jest.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('removeSkill', () => {
    it('should remove a skill from a CV', async () => {
      const updatedCv: Cv = {
        id: 1,
        name: 'John Doe',
        firstname: 'John',
        age: 30,
        cin: '12345678',
        job: 'Developer',
        path: '/path/to/cv',
        skills: [],
        user: null,
      };

      jest.spyOn(service, 'removeSkill').mockResolvedValue(updatedCv);

      const result = await controller.removeSkill(1, 1);

      expect(service.removeSkill).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(updatedCv);
    });
  });

  describe('findByUser', () => {
    it('should return CVs for a specific user', async () => {
      const cvs: Cv[] = [
        {
          id: 1,
          name: 'John Doe',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Developer',
          path: '/path/to/cv',
          skills: [],
          user: mockUser,
        },
      ];

      jest.spyOn(service, 'findByUser').mockResolvedValue(cvs);

      const result = await controller.findByUser(1);

      expect(service.findByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(cvs);
    });
  });

  describe('findBySkill', () => {
    it('should return CVs with a specific skill', async () => {
      const cvs: Cv[] = [
        {
          id: 1,
          name: 'John Doe',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Developer',
          path: '/path/to/cv',
          skills: mockSkills.slice(0, 1),
          user: null,
        },
      ];

      jest.spyOn(service, 'findBySkill').mockResolvedValue(cvs);

      const result = await controller.findBySkill(1);

      expect(service.findBySkill).toHaveBeenCalledWith(1);
      expect(result).toEqual(cvs);
    });
  });
});
