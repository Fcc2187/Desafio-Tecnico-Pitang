import { PrismaClient, Perfil } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pitang.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@pitang.com',
      senha: passwordHash,
      perfil: Perfil.ADMIN,
    },
  });

  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@pitang.com' },
    update: {},
    create: {
      nome: 'Gestor',
      email: 'gestor@pitang.com',
      senha: passwordHash,
      perfil: Perfil.GESTOR,
    },
  });

  const financeiro = await prisma.user.upsert({
    where: { email: 'financeiro@pitang.com' },
    update: {},
    create: {
      nome: 'Financeiro',
      email: 'financeiro@pitang.com',
      senha: passwordHash,
      perfil: Perfil.FINANCEIRO,
    },
  });

  const colaborador1 = await prisma.user.upsert({
    where: { email: 'colaborador1@pitang.com' },
    update: {},
    create: {
      nome: 'Colaborador Um',
      email: 'colaborador1@pitang.com',
      senha: passwordHash,
      perfil: Perfil.COLABORADOR,
    },
  });

  const colaborador2 = await prisma.user.upsert({
    where: { email: 'colaborador2@pitang.com' },
    update: {},
    create: {
      nome: 'Colaborador Dois',
      email: 'colaborador2@pitang.com',
      senha: passwordHash,
      perfil: Perfil.COLABORADOR,
    },
  });

  const categories = [
    { nome: 'Alimentação', ativo: true, limiteValor: 500 },
    { nome: 'Transporte', ativo: true, limiteValor: 300 },
    { nome: 'Hospedagem', ativo: true, limiteValor: 2000 },
    { nome: 'Equipamentos', ativo: true, limiteValor: 5000 },
    { nome: 'Outros', ativo: true, limiteValor: null },
    { nome: 'Despesa Médica', ativo: false, limiteValor: null },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { nome: cat.nome, deletadoEm: null }
    });

    if (!existing) {
      await prisma.category.create({
        data: cat
      });
    }
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
