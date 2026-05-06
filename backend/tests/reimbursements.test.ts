import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

describe('Reimbursements Module Integration Tests', () => {
  let token: string;
  let categoryId: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Criar categoria ativa
    const category = await prisma.category.create({
      data: { nome: 'Viagem', ativo: true }
    });
    categoryId = category.id;

    // Criar usuário e logar
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        nome: 'Colaborador Teste',
        email: 'colab@example.com',
        senha: password,
        perfil: 'COLABORADOR'
      }
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'colab@example.com', senha: 'password123' });
    
    token = loginResponse.body.token;
  });

  it('should be able to create a reimbursement draft', async () => {
    const response = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoriaId: categoryId,
        descricao: 'Almoço com cliente',
        valor: 50.5,
        dataDespesa: new Date().toISOString()
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('RASCUNHO');
    expect(Number(response.body.valor)).toBe(50.5);
  });

  it('should not be able to create reimbursement with inactive category', async () => {
    const inactiveCat = await prisma.category.create({
      data: { nome: 'Inativa', ativo: false }
    });

    const response = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoriaId: inactiveCat.id,
        descricao: 'Teste Inativa',
        valor: 10,
        dataDespesa: new Date().toISOString()
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Categoria não encontrada ou inativa');
  });

  it('should list only owner reimbursements for COLABORADOR', async () => {
    // Criar um reembolso para o usuário logado
    await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoriaId: categoryId,
        descricao: 'Meu Reembolso',
        valor: 100,
        dataDespesa: new Date().toISOString()
      });

    // Criar outro usuário e outro reembolso
    const otherUser = await prisma.user.create({
      data: {
        nome: 'Outro',
        email: 'outro@example.com',
        senha: 'hash',
        perfil: 'COLABORADOR'
      }
    });
    await prisma.reimbursement.create({
      data: {
        solicitanteId: otherUser.id,
        categoriaId: categoryId,
        descricao: 'Reembolso Alheio',
        valor: 200,
        dataDespesa: new Date(),
        status: 'ENVIADO'
      }
    });

    const response = await request(app)
      .get('/reimbursements')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].descricao).toBe('Meu Reembolso');
  });

  it('should be able to add an attachment and generate history', async () => {
    const createResponse = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoriaId: categoryId,
        descricao: 'Viagem SP',
        valor: 500,
        dataDespesa: new Date().toISOString()
      });
    
    const reimbursementId = createResponse.body.id;

    const attachResponse = await request(app)
      .post(`/reimbursements/${reimbursementId}/attachments`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake pdf content'), 'comprovante.pdf');

    expect(attachResponse.status).toBe(201);
    expect(attachResponse.body.nomeArquivo).toBe('comprovante.pdf');

    const historyResponse = await request(app)
      .get(`/reimbursements/${reimbursementId}`)
      .set('Authorization', `Bearer ${token}`);

    const history = historyResponse.body.history;
    const hasAttachmentHistory = history.some((h: any) => h.observacao.includes('Anexo carregado'));
    
    expect(hasAttachmentHistory).toBe(true);
  });

  it('should allow updating a draft above the attachment threshold when an attachment already exists', async () => {
    const createResponse = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoriaId: categoryId,
        descricao: 'Viagem com comprovante',
        valor: 500,
        dataDespesa: new Date().toISOString()
      });

    const reimbursementId = createResponse.body.id;

    await prisma.attachment.create({
      data: {
        solicitacaoId: reimbursementId,
        nomeArquivo: 'comprovante.pdf',
        urlArquivo: 'https://storage.com/file.pdf',
        tipoArquivo: 'application/pdf',
      },
    });

    const updateResponse = await request(app)
      .put(`/reimbursements/${reimbursementId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        valor: 1500,
      });

    expect(updateResponse.status).toBe(200);
    expect(Number(updateResponse.body.valor)).toBe(1500);
  });

  describe('Business Rules & Status Transitions', () => {
    let reimbursementId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/reimbursements')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoriaId: categoryId,
          descricao: 'Solicitação para teste de fluxo',
          valor: 2000,
          dataDespesa: new Date().toISOString()
        });
      reimbursementId = response.body.id;
    });

    it('should NOT allow submitting a reimbursement > 1000 without an attachment', async () => {
      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/submit`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Comprovante obrigatório para valores acima de R$ 1.000,00');
    });

    it('should allow submitting a reimbursement > 1000 WITH an attachment', async () => {
      // Adicionar anexo
      await request(app)
        .post(`/reimbursements/${reimbursementId}/attachments`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake pdf'), 'recibo.pdf');

      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/submit`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ENVIADO');
    });

    it('should NOT allow a COLABORADOR to approve their own reimbursement (403)', async () => {
      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/approve`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should NOT allow rejecting without a justification (400)', async () => {
      // Primeiro enviar para análise (com anexo para passar na regra de > 1000)
      await request(app).post(`/reimbursements/${reimbursementId}/attachments`).set('Authorization', `Bearer ${token}`).attach('file', Buffer.from('f'), 'f.pdf');
      await request(app).post(`/reimbursements/${reimbursementId}/submit`).set('Authorization', `Bearer ${token}`);

      // Criar e Logar como GESTOR
      const gestorPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: { nome: 'Gestor', email: 'gestor@test.com', senha: gestorPassword, perfil: 'GESTOR' }
      });
      const loginGestor = await request(app).post('/auth/login').send({ email: 'gestor@test.com', senha: 'password123' });
      const gestorToken = loginGestor.body.token;

      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/reject`)
        .set('Authorization', `Bearer ${gestorToken}`)
        .send({ justificativaRejeicao: '' });

      expect(response.status).toBe(400);
    });

    it('should allow GESTOR to approve a submitted reimbursement', async () => {
      await request(app).post(`/reimbursements/${reimbursementId}/attachments`).set('Authorization', `Bearer ${token}`).attach('file', Buffer.from('f'), 'f.pdf');
      await request(app).post(`/reimbursements/${reimbursementId}/submit`).set('Authorization', `Bearer ${token}`);

      const gestorPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: { nome: 'Gestor 2', email: 'gestor2@test.com', senha: gestorPassword, perfil: 'GESTOR' }
      });
      const loginGestor = await request(app).post('/auth/login').send({ email: 'gestor2@test.com', senha: 'password123' });
      const gestorToken = loginGestor.body.token;

      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/approve`)
        .set('Authorization', `Bearer ${gestorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('APROVADO');
    });

    it('should allow FINANCEIRO to pay an approved reimbursement', async () => {
      // Fluxo completo: Rascunho -> Enviado -> Aprovado
      await request(app).post(`/reimbursements/${reimbursementId}/attachments`).set('Authorization', `Bearer ${token}`).attach('file', Buffer.from('f'), 'f.pdf');
      await request(app).post(`/reimbursements/${reimbursementId}/submit`).set('Authorization', `Bearer ${token}`);
      
      const gestorPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({ data: { nome: 'G', email: 'g@t.com', senha: gestorPassword, perfil: 'GESTOR' } });
      const lg = await request(app).post('/auth/login').send({ email: 'g@t.com', senha: 'password123' });
      await request(app).post(`/reimbursements/${reimbursementId}/approve`).set('Authorization', `Bearer ${lg.body.token}`);

      // Logar como FINANCEIRO
      const finPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({ data: { nome: 'Fin', email: 'fin@test.com', senha: finPassword, perfil: 'FINANCEIRO' } });
      const loginFin = await request(app).post('/auth/login').send({ email: 'fin@test.com', senha: 'password123' });
      const finToken = loginFin.body.token;

      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/pay`)
        .set('Authorization', `Bearer ${finToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('PAGO');
    });

    it('should allow owner to cancel a draft', async () => {
      const response = await request(app)
        .post(`/reimbursements/${reimbursementId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CANCELADO');
    });

    describe('Dashboard & History', () => {
      it('should return correct dashboard stats', async () => {
        await prisma.reimbursement.create({
          data: {
            solicitanteId: userId,
            categoriaId: categoryId,
            descricao: 'Pago',
            valor: 100,
            status: 'PAGO',
            dataDespesa: new Date()
          }
        });

        const response = await request(app)
          .get('/reimbursements/stats')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.stats).toHaveProperty('totalPago');
        expect(response.body.stats).toHaveProperty('pendentes');
        expect(response.body.stats).toHaveProperty('aprovadasMes');
      });

      it('should return history for a specific reimbursement', async () => {
        const createResponse = await request(app)
          .post('/reimbursements')
          .set('Authorization', `Bearer ${token}`)
          .send({
            categoriaId: categoryId,
            descricao: 'Histórico Teste',
            valor: 50,
            dataDespesa: new Date().toISOString()
          });
        
        const id = createResponse.body.id;

        const response = await request(app)
          .get(`/reimbursements/${id}/history`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
  });
});
