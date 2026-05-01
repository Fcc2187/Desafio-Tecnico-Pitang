import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome da categoria é obrigatório'),
    ativo: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    nome: z.string().min(2, 'Nome da categoria é obrigatório').optional(),
    ativo: z.boolean().optional(),
  }),
});
