import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnection, Repository } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

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

  describe('userProfile', () => {
    //
    const userId = 1;
    it("should see user's profile", async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .set('x-jwt', token)
        .send({
          query: `
        {
          userProfile (userId : ${userId}){
            ok
            error
            user {
              id
            }
          }
        }
      `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user.id).toBe(userId);
        });
    });

    it('should not found a profile', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .set('x-jwt', token)
        .send({
          query: `
        {
          userProfile (userId :2){
            ok
            error
            user {
              id
            }
          }
        }
      `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Not Found User');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .set('x-jwt', token)
        .send({
          query: `
          {
            me {
              email
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { me },
            },
          } = res;
          expect(me.email).toBe(EMAIL);
        });
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_END_POINT)
        .send({
          query: `
          {
            me {
              email
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  it.todo('verifyEmail');
  it.todo('editProfile');
});
