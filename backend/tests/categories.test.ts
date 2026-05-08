import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

describe('Categories Module Integration Tests', () => {
  let adminToken: string;
  let colabToken: string;

  beforeEach(async () => {
    await cleanDatabase();

    const password = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: { nome: 'Admin', email: 'admin@test.com', senha: password, perfil: 'ADMIN' }
    });

    await prisma.user.create({
      data: { nome: 'Colab', email: 'colab@test.com', senha: password, perfil: 'COLABORADOR' }
    });

    const adminLogin = await request(app).post('/auth/login').send({ email: 'admin@test.com', senha: 'password123' });
    adminToken = adminLogin.body.token;

    const colabLogin = await request(app).post('/auth/login').send({ email: 'colab@test.com', senha: 'password123' });
    colabToken = colabLogin.body.token;
  });

  it('should be able to create a category as ADMIN', async () => {
    const response = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Combustível' });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Combustível');
  });

  it('should not be able to create a category as COLABORADOR', async () => {
    const response = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${colabToken}`)
      .send({ nome: 'Tentativa' });

    expect(response.status).toBe(403);
  });

  it('should be able to list categories (any authenticated user)', async () => {
    await prisma.category.create({ data: { nome: 'Alimentação' } });

    const response = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${colabToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to update a category as ADMIN', async () => {
    const cat = await prisma.category.create({ data: { nome: 'Update Me' } });

    const response = await request(app)
      .put(`/categories/${cat.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe('Updated Name');
  });

  it('should be able to soft delete a category as ADMIN', async () => {
    const cat = await prisma.category.create({ data: { nome: 'Delete Me' } });

    const response = await request(app)
      .delete(`/categories/${cat.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const deletedCat = await prisma.category.findUnique({ where: { id: cat.id } });
    expect(deletedCat?.ativo).toBe(false);
  });
});
