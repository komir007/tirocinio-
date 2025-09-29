import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserSettings } from '../user-settings/user-settings.entity';
import { Repository } from 'typeorm';

function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((e) => e),
    save: jest.fn(async (e) => e),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as Partial<Repository<any>>;
}

describe('UserController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: createRepositoryMock() },
        { provide: getRepositoryToken(UserSettings), useValue: createRepositoryMock() },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
