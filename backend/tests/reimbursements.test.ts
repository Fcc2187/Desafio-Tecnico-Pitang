import request from 'supertest';
import { app } from '../src/app';
import { cleanDatabase } from './setup';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

describe('Reimbursements Module Integration Tests', () => {
  let token: string;
  let categoryId: string;

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
      .send({
        nomeArquivo: 'comprovante.pdf',
        urlArquivo: 'https://storage.com/file.pdf',
        tipoArquivo: 'application/pdf'
      });

    expect(attachResponse.status).toBe(201);
    expect(attachResponse.body.nomeArquivo).toBe('comprovante.pdf');

    const historyResponse = await request(app)
      .get(`/reimbursements/${reimbursementId}`)
      .set('Authorization', `Bearer ${token}`);

    const history = historyResponse.body.history;
    const hasAttachmentHistory = history.some((h: any) => h.observacao.includes('Anexo adicionado'));
    
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
});
