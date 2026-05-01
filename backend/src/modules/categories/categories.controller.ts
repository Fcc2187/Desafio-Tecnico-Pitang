import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { criadoEm: 'desc' },
  });

  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { nome, ativo } = req.body;

  const category = await prisma.category.create({
    data: {
      nome,
      ativo: ativo ?? true,
    },
  });

  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { nome, ativo } = req.body;

  const categoryExists = await prisma.category.findUnique({ where: { id } });

  if (!categoryExists) {
    throw new AppError('Categoria não encontrada', 404);
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      nome,
      ativo,
    },
  });

  res.json(updatedCategory);
};
