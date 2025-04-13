import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Cv } from '../cvs/entities/cv.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let mockCvRepository: Partial<Record<keyof Repository<Cv>, jest.Mock>>;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCvRepository = {
      findBy: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Cv),
          useValue: mockCvRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return the saved entity', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const newUser = {
        id: 1,
        ...createUserDto,
        cvs: [],
      };

      mockUserRepository.create?.mockReturnValue(newUser);
      mockUserRepository.save?.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users with their cvs', async () => {
      const users = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          password: 'pass1',
          cvs: [],
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          password: 'pass2',
          cvs: [],
        },
      ];

      mockUserRepository.find?.mockResolvedValue(users);

      const result = await service.findAll(true);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['cvs'],
      });
      expect(result).toEqual(users);
    });

    it('should return an array of users without relations', async () => {
      const users = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          password: 'pass1',
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          password: 'pass2',
        },
      ];

      mockUserRepository.find?.mockResolvedValue(users);

      const result = await service.findAll(false);

      expect(mockUserRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id with relations', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      mockUserRepository.findOne?.mockResolvedValue(user);

      const result = await service.findOne(1, true);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cvs'],
      });
      expect(result).toEqual(user);
    });

    it('should return a single user by id without relations', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOneBy?.mockResolvedValue(user);

      const result = await service.findOne(1, false);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(user);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username with relations', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      mockUserRepository.findOne?.mockResolvedValue(user);

      const result = await service.findByUsername('testuser');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['cvs'],
      });
      expect(result).toEqual(user);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email with relations', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      mockUserRepository.findOne?.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['cvs'],
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated entity', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      const updateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
        cvs: [1, 2],
      };

      const updatedUser = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        password: 'password123',
        cvs: [],
      };

      // Mock update method
      mockUserRepository.update?.mockResolvedValue({ affected: 1 });

      // Mock findOne for after the update (when cvs are provided)
      mockUserRepository.findOne?.mockResolvedValue(user);

      // Mock findOne for the final return (with true parameter for withCvs)
      mockUserRepository.findOne?.mockResolvedValue(updatedUser);

      // Mock findBy for CV entities
      mockCvRepository.findBy?.mockResolvedValue([
        { id: 1, user: null },
        { id: 2, user: null },
      ]);

      // Mock save for CV entities
      mockCvRepository.save?.mockResolvedValue(null);

      const result = await service.update(1, updateUserDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        username: 'updateduser',
        email: 'updated@example.com',
      });

      expect(mockCvRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user does not exist during update', async () => {
      mockUserRepository.update?.mockResolvedValue({ affected: 0 });

      await expect(
        service.update(999, { username: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockUserRepository.update).toHaveBeenCalledWith(999, {
        username: 'nonexistent',
      });
    });
  });

  describe('remove', () => {
    it('should remove a user and return success status', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      mockUserRepository.findOne?.mockResolvedValue(user);
      mockUserRepository.delete?.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cvs'],
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne?.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['cvs'],
      });
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
