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
  let token: string;
  const EMAIL = 'test@co.kr';
  const PASSWORD = 'test123';

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
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation {
            createAccount(input:{
              email : "${EMAIL}",
              password : "${PASSWORD}",
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
              email : "${EMAIL}",
              password : "${PASSWORD}",
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
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation{
            login (input:{
              email : "${EMAIL}",
              password : "${PASSWORD}"
            }){
              ok,
              error,
              token
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          token = login.token;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });

    it('should fail if the password is wrong', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation{
            login (input:{
              email : "${EMAIL}",
              password : "WRONG PASSWORD"
            }){
              ok,
              error,
              token
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password');
          expect(login.token).toBe(null);
        });
    });

    it('should fail if the user not found ', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          mutation{
            login (input:{
              email : "NOT EXIST EMAIL",
              password : "${PASSWORD}"
            }){
              ok,
              error,
              token
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Not Found User');
          expect(login.token).toBe(null);
        });
    });
  });
  it.todo('userProfile');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
