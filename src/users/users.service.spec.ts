import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockJwtRepository = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailRepository = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;
  let verificationRepository: MockRepository;
  let mailService: MailService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtRepository,
        },
        {
          provide: MailService,
          useValue: mockMailRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
    verificationRepository = module.get<MockRepository>(
      getRepositoryToken(Verification),
    );
    mailService = module.get<MailService>(MailService);
  });

  it('shoud be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user exists ', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'MOCK!!!!!!',
      });

      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });

      expect(result).toMatchObject({ ok: false, error: 'exist user' });
    });

    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount(createAccountArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toMatchObject({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });

      expect(result).toMatchObject({
        ok: false,
        error: "Couldn't create user",
      });
    });
  });

  });

  it.todo('login');
  it.todo('findById');
  it.todo('editUserProfile');
  it.todo('verifyEmail');
});
