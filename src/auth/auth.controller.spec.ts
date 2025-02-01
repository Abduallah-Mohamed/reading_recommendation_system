import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterAuthDto, LoginAuthDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterAuthDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };
      const registerResponse = {
        status_code: '201',
        message: 'User created successfully',
        data: {
          access_token: 'mock_token',
        },
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(registerResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return a successful login response', async () => {
      const loginDto: LoginAuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResponse = {
        status_code: '200',
        message: 'Login successful',
        data: {
          access_token: 'mock_token',
        },
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      const loginDto: LoginAuthDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });
});
