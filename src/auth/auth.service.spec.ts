import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto';
import { CreateUserDto, Role } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock UsersService
const mockUsersService = () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
});

// Mock JwtService
const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterAuthDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'Test User',
      };
      const createUserDto: CreateUserDto = { ...registerDto, role: Role.USER };
      const mockUser: Partial<User> = { id: 1, ...createUserDto };

      (usersService.create as jest.Mock).mockResolvedValue({
        status_code: 'success',
        message: 'User created successfully',
        data: mockUser as User,
      });

      const result = await authService.register(registerDto);

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual('User created successfully');
      expect(result.data).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should successfully log in a user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser: Partial<User> = {
        id: 1,
        email,
        password: await bcrypt.hash(password, 10),
        role: Role.USER,
      };
      const mockToken = 'mockAccessToken';

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(email, password);

      expect(result).toEqual({ access_token: mockToken });
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const mockUser: Partial<User> = {
        id: 1,
        email,
        password: await bcrypt.hash(password, 10),
        role: Role.USER,
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(email, wrongPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});
