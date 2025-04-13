import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Cv } from '../cvs/entities/cv.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
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
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const newUser = {
        id: 1,
        ...createUserDto,
        cvs: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(newUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users without CVs', async () => {
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

      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(users);
    });

    it('should return an array of users with CVs', async () => {
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

      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id without CVs', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(user);
    });

    it('should return a single user by id with CVs', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne(1, 'true');

      expect(service.findOne).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(user);
    });
  });

  describe('findUserCvs', () => {
    it("should return a user's CVs", async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        cvs: [],
      };

      const cvs = [
        {
          id: 1,
          name: 'CV 1',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Developer',
          path: '/path/to/cv1',
          skills: [],
          user: user,
        },
        {
          id: 2,
          name: 'CV 2',
          firstname: 'John',
          age: 30,
          cin: '12345678',
          job: 'Designer',
          path: '/path/to/cv2',
          skills: [],
          user: user,
        },
      ];

      jest.spyOn(service, 'findUserCvs').mockResolvedValue(cvs);

      const result = await controller.findUserCvs(1);

      expect(service.findUserCvs).toHaveBeenCalledWith(1);
      expect(result).toEqual(cvs);
    });
  });

  describe('findUsersWithMostCvs', () => {
    it('should return users with the most CVs', async () => {
      const users = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          cvCount: '3',
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          cvCount: '2',
        },
      ];

      jest.spyOn(service, 'findUsersWithMostCvs').mockResolvedValue(users);

      const result = await controller.findUsersWithMostCvs('2');

      expect(service.findUsersWithMostCvs).toHaveBeenCalledWith(2);
      expect(result).toEqual(users);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const updatedUser = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        password: 'password123',
        cvs: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('removeCvFromUser', () => {
    it('should remove a CV from a user', async () => {
      const result = { success: true };

      jest.spyOn(service, 'removeCvFromUser').mockResolvedValue(result);

      expect(await controller.removeCvFromUser(1, 1)).toEqual(result);
      expect(service.removeCvFromUser).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('remove', () => {
    it('should remove a user and return success result', async () => {
      const deleteResult = { deleted: true };

      jest.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
