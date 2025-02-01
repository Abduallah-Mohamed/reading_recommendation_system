import { Test, TestingModule } from '@nestjs/testing';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-readings.dto';

describe('ReadingsController', () => {
  let controller: ReadingsController;
  let service: ReadingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [
        {
          provide: ReadingsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReadingsController>(ReadingsController);
    service = module.get<ReadingsService>(ReadingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reading', async () => {
      const createReadingDto: CreateReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 100,
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        password: 'password123',
        readings: [],
        hashPassword: async function () {
          return;
        },
      };
      const createdReading = {
        status_code: '200',
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdReading);

      const result = await controller.create(createReadingDto, mockUser);

      expect(result).toEqual(createdReading);
      expect(service.create).toHaveBeenCalledWith(createReadingDto, mockUser);
    });

    it('should handle errors during creation', async () => {
      const createReadingDto: CreateReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 100,
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        password: 'password123',
        readings: [],
        hashPassword: async function () {
          return;
        },
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Error creating reading'));

      await expect(
        controller.create(createReadingDto, mockUser),
      ).rejects.toThrow('Error creating reading');
      expect(service.create).toHaveBeenCalledWith(createReadingDto, mockUser);
    });
  });
});
