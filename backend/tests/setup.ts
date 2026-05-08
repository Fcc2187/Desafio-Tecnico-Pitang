import 'dotenv/config';
import { prisma } from '../src/prisma';
import fs from 'fs';
import path from 'path';

beforeAll(async () => {
  await prisma.$connect();

  const testUploadsDir = path.resolve(__dirname, '..', 'uploads', 'tests');

  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }
});

afterAll(async () => {
  await prisma.$disconnect();

  const testUploadsDir = path.resolve(__dirname, '..', 'uploads', 'tests');
  if (fs.existsSync(testUploadsDir)) {
    fs.rmSync(testUploadsDir, { recursive: true, force: true });
  }
});

export const cleanDatabase = async () => {
  
  await prisma.reimbursementHistory.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reimbursement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
};
