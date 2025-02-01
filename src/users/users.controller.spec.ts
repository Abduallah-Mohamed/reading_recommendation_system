import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { ExecutionContext } from '@nestjs/common';

// Mock UsersService
const mockUsersService = () => ({
  create: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useFactory: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1, email: 'admin@example.com', roles: ['admin'] }; // Simulate admin user
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Allow all roles for simplicity in these tests
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with admin role', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER, // or ADMIN, based on your test case
      };
      const createdUser: Partial<User> = { id: 1, ...createUserDto };

      (service.create as jest.Mock).mockResolvedValue({
        status_code: 'success',
        message: 'User created successfully',
        data: createdUser,
      });

      const result = await controller.create(createUserDto);

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual('User created successfully');
      expect(result.data).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      (service.create as jest.Mock).mockRejectedValue(
        new Error('Error creating user'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Error creating user',
      );
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
