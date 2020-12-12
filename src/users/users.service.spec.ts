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
  findOneOrFail: jest.fn(),
});

const mockJwtRepository = {
  sign: jest.fn(() => 'sign token'),
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
  let jwtService: JwtService;

  beforeEach(async () => {
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
    jwtService = module.get<JwtService>(JwtService);
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

  describe('login', () => {
    const loginArgs = {
      email: 'mock@co.kr',
      password: 'mock1234',
    };

    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.login(loginArgs);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatchObject({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(result).toMatchObject({ ok: false, error: 'Wrong password' });
    });

    it('should return token if the password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: expect.any(Number) });
      expect(result).toMatchObject({ ok: true, token: 'sign token' });
    });
  });

  describe('findById', () => {
    const findByIdAgrs = {
      id: 1,
    };

    it('should fail if user not found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toMatchObject({ ok: false, error: 'Not Found User' });
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        id: expect.any(Number),
      });
    });

    it('should found user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdAgrs);
      const result = await service.findById(1);
      expect(result).toMatchObject({
        ok: true,
        user: findByIdAgrs,
      });
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        id: expect.any(Number),
      });
    });
  });

  describe('editUserProfile', () => {
    const oldUser = {
      email: 'old@.co.kr',
      verified: true,
    };

    const editProfileAgrs = {
      id: 1,
      input: { email: 'new@co.kr' },
    };

    const newVerification = {
      code: 'code',
    };

    const newUser = {
      verified: false,
      email: editProfileAgrs.input.email,
    };

    it('should change email', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.findOneOrFail.mockResolvedValue(oldUser);

      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editUserProfile(editProfileAgrs.id, editProfileAgrs.input);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);

      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileAgrs.input,
      );
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith(
        editProfileAgrs.id,
      );
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const oldUser = {
        password: '1212',
        verified: true,
      };
      const editProfileAgrs = {
        id: 1,
        input: { password: '1234' },
      };
      const newUser = {
        verified: false,
        password: editProfileAgrs.input.password,
      };
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.findOneOrFail.mockResolvedValue(oldUser);
      await service.editUserProfile(editProfileAgrs.id, editProfileAgrs.input);

      expect(userRepository.save).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('sholud fail on exception', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.editUserProfile(
        editProfileAgrs.id,
        editProfileAgrs.input,
      );
      expect(result).toEqual({
        ok: false,
        error: "'Could not update profile'",
      });
    });
  });

  // describe('verifyEmail', () => {});
});
