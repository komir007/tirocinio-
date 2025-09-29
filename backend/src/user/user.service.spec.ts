import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserSettings } from '../user-settings/user-settings.entity';
import { Repository } from 'typeorm';

// Helper per creare mock repository semplice
function createRepositoryMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((e) => e),
    save: jest.fn(async (e) => ({ id: 1, ...e })),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as Partial<Repository<any>>;
}

describe('UserService', () => {
  let service: UsersService;

  let userRepoMock: any;
  let userSettingsRepoMock: any;

  beforeEach(async () => {
    userRepoMock = createRepositoryMock();
    userSettingsRepoMock = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: getRepositoryToken(UserSettings), useValue: userSettingsRepoMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects hidden field on create', async () => {
    // Simula configurazione: surname hidden
    userRepoMock.findOne.mockResolvedValueOnce({ id: 99, email: 'admin@test.com' }); // creator lookup
    userSettingsRepoMock.findOne.mockResolvedValueOnce({
      customizationConfig: {
        fields: {
          surname: { visible: false },
          name: { visible: true },
        },
      },
    });

    await expect(
      service.create({ email: 'u@test.com', password: 'secretpw', surname: 'X', createdBy: 'admin@test.com' }),
    ).rejects.toThrow(/non è attualmente visibile/);
  });

  it('allows visible field on create', async () => {
    userRepoMock.findOne.mockResolvedValueOnce({ id: 99, email: 'admin@test.com' });
    userSettingsRepoMock.findOne.mockResolvedValueOnce({
      customizationConfig: { fields: { name: { visible: true } } },
    });

    await expect(
      service.create({ email: 'v@test.com', password: 'secretpw', name: 'Mario', createdBy: 'admin@test.com' }),
    ).resolves.toMatchObject({ email: 'v@test.com', name: 'Mario' });
  });
});
