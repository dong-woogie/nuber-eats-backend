import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

const TEST_KEY = 'testKey';
const PAYLOAD = { id: 1 };
const TOKEN = 'TOKEN';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => TOKEN),
    verify: jest.fn(() => PAYLOAD),
  };
});

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            privateKey: TEST_KEY,
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return token', () => {
      const result = service.sign(PAYLOAD);

      expect(result).toBe(TOKEN);
      expect(jwt.sign).toHaveBeenCalledWith(PAYLOAD, TEST_KEY);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('verify', () => {
    it('should return the deoded token', () => {
      const result = service.verify(TOKEN);

      expect(result).toEqual(PAYLOAD);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
