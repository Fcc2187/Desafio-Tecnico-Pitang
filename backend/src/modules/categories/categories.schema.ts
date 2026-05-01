import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome muito curto'),
    limiteValor: z.number().positive('O limite deve ser maior que zero').optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    nome: z.string().min(2, 'Nome muito curto').optional(),
    ativo: z.boolean().optional(),
    limiteValor: z.number().positive('O limite deve ser maior que zero').optional().nullable(),
  }),
});
