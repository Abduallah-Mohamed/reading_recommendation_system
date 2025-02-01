import { Test, TestingModule } from '@nestjs/testing';
import { UserBooksService } from './favorites.service';

describe('UserBooksService', () => {
  let service: UserBooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserBooksService],
    }).compile();

    service = module.get<UserBooksService>(UserBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
