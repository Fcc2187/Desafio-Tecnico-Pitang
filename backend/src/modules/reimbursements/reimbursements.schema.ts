import { z } from 'zod';

export const createReimbursementSchema = z.object({
  body: z.object({
    categoriaId: z.string().uuid('ID de categoria inválido'),
    descricao: z.string().min(3, 'Descrição muito curta'),
    valor: z.number().positive('O valor deve ser maior que zero'),
    dataDespesa: z.string().datetime('Data da despesa inválida'),
  }),
});

export const updateReimbursementSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    categoriaId: z.string().uuid('ID de categoria inválido').optional(),
    descricao: z.string().min(3, 'Descrição muito curta').optional(),
    valor: z.number().positive('O valor deve ser maior que zero').optional(),
    dataDespesa: z.string().datetime('Data da despesa inválida').optional(),
  }),
});

export const rejectReimbursementSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    justificativaRejeicao: z.string().min(5, 'Justificativa é obrigatória e deve ter pelo menos 5 caracteres'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});
