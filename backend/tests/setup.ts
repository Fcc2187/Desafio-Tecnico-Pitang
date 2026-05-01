import 'dotenv/config';
import { prisma } from '../src/prisma';

beforeAll(async () => {
  // Conectar ao banco
  await prisma.$connect();
});

afterAll(async () => {
  // Limpar dados de teste e desconectar
  await prisma.$disconnect();
});

export const cleanDatabase = async () => {
  // Ordem reversa de dependência
  await prisma.reimbursementHistory.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reimbursement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
};
