import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { deletadoEm: null },
    orderBy: { criadoEm: 'desc' },
  });

  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { nome, limiteValor } = req.body;

  const category = await prisma.category.create({
    data: { nome, limiteValor },
  });

  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { nome, ativo, limiteValor } = req.body;

  const item = await prisma.category.findFirst({ 
    where: { id, deletadoEm: null } 
  });

  if (!item) {
    throw new AppError('Categoria não encontrada ou já excluída', 404);
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      nome,
      ativo,
      limiteValor,
    },
  });

  res.json(updated);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const item = await prisma.category.findFirst({ 
    where: { id, deletadoEm: null } 
  });

  if (!item) {
    throw new AppError('Categoria não encontrada ou já excluída', 404);
  }

  await prisma.category.update({
    where: { id },
    data: { 
      deletadoEm: new Date(),
      ativo: false 
    },
  });

  res.status(204).send();
};
