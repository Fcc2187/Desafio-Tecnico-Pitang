import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

describe('Users Module Integration Tests (Admin)', () => {
  let adminToken: string;
  let colabToken: string;
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const password = await bcrypt.hash('123456', 10);
    
    // Criar Admin
    await prisma.user.create({
      data: { nome: 'Admin', email: 'admin@test.com', senha: password, perfil: 'ADMIN' }
    });

    // Criar Colaborador
    const colab = await prisma.user.create({
      data: { nome: 'Colab', email: 'colab@test.com', senha: password, perfil: 'COLABORADOR' }
    });
    testUserId = colab.id;

    const adminLogin = await request(app).post('/auth/login').send({ email: 'admin@test.com', senha: '123456' });
    adminToken = adminLogin.body.token;

    const colabLogin = await request(app).post('/auth/login').send({ email: 'colab@test.com', senha: '123456' });
    colabToken = colabLogin.body.token;
  });

  it('should list all users for ADMIN', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should NOT allow COLABORADOR to list all users', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${colabToken}`);

    expect(response.status).toBe(403);
  });

  it('should update user profile/role as ADMIN', async () => {
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'GESTOR' });

    expect(response.status).toBe(200);
    expect(response.body.perfil).toBe('GESTOR');
  });

  it('should return 404 when updating non-existent user', async () => {
    const response = await request(app)
      .patch('/users/non-existent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'GESTOR' });

    expect(response.status).toBe(404);
  });
});
