import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { getConnection } from 'typeorm';

describe('UserModule E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('createAccount');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});