import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      criadoEm: true,
    },
    orderBy: { criadoEm: 'desc' }
  });

  res.json(users);
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      criadoEm: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json(user);
};
