import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';

describe('Auth Module Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'password123',
        perfil: 'COLABORADOR'
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should not be able to register with an existing email', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        nome: 'First User',
        email: 'duplicate@example.com',
        senha: 'password123'
      });

    const response = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Second User',
        email: 'duplicate@example.com',
        senha: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email já está em uso');
  });

  it('should be able to login', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        nome: 'Login User',
        email: 'login@example.com',
        senha: 'password123'
      });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'login@example.com',
        senha: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to login with wrong credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        senha: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciais inválidas');
  });
});

