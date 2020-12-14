import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

jest.mock('got', () => ({
  post: jest.fn(),
}));

const GRAPHQL_END_POINT = '/graphql';

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

  describe('createAccount', () => {
    const email = 'test@co.kr';

    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation {
            createAccount(input:{
              email : "${email}",
              password : "test123",
              role : Client
            }) {
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation {
            createAccount(input:{
              email : "${email}",
              password : "test123",
              role : Client
            }) {
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe('exist user');
        });
    });

    it.todo('userProfile');
    it.todo('me');
    it.todo('login');
    it.todo('verifyEmail');
    it.todo('editProfile');
  });
});
