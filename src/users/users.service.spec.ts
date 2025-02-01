import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // Mock the repository
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };
      const createdUser: Partial<User> = { id: 1, ...createUserDto };

      jest.spyOn(userRepository, 'create').mockReturnValue(createdUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(createdUser as User);

      const result = await service.create(createUserDto);

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual('User created successfully');
      expect(result.data).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      jest.spyOn(userRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOneById', () => {
    it('should find a user by ID successfully', async () => {
      const userId = 1;
      const mockUser: Partial<User> = {
        id: userId,
        username: 'Test User',
        email: 'test@example.com',
        role: Role.USER,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.findOneById(userId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOneById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should handle errors during user retrieval', async () => {
      const userId = 1;

      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findOneById(userId)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email successfully', async () => {
      const userEmail = 'test@example.com';
      const mockUser: Partial<User> = {
        id: 1,
        username: 'Test User',
        email: userEmail,
        role: Role.USER,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.findByEmail(userEmail);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userEmail = 'test@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findByEmail(userEmail)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });

    it('should handle errors during user retrieval', async () => {
      const userEmail = 'test@example.com';

      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findByEmail(userEmail)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });
  });
});
