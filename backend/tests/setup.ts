import 'dotenv/config';
import { prisma } from '../src/prisma';
import fs from 'fs';
import path from 'path';

beforeAll(async () => {
  // Conectar ao banco
  await prisma.$connect();

  // Garantir que a pasta de uploads de teste exista
  const testUploadsDir = path.resolve(__dirname, '..', 'uploads', 'tests');
  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }
});

afterAll(async () => {
  // Limpar dados de teste e desconectar
  await prisma.$disconnect();

  // Limpar pasta de uploads de teste
  const testUploadsDir = path.resolve(__dirname, '..', 'uploads', 'tests');
  if (fs.existsSync(testUploadsDir)) {
    fs.rmSync(testUploadsDir, { recursive: true, force: true });
  }
});

export const cleanDatabase = async () => {
  // Ordem reversa de dependência
  await prisma.reimbursementHistory.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reimbursement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
};
