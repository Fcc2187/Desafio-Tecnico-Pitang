import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';

describe('Global Error Handling Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return 404 for a non-existent route', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');
    expect(response.status).toBe(404);
  });

  it('should return 401 for a protected route without token', async () => {
    const response = await request(app).get('/reimbursements');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token não fornecido');
  });

  it('should return 401 for a protected route with invalid token', async () => {
    const response = await request(app)
      .get('/reimbursements')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token JWT inválido ou expirado');
  });
});
