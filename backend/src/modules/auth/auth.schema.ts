import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    perfil: z.enum(['COLABORADOR', 'GESTOR', 'FINANCEIRO', 'ADMIN']).optional().default('COLABORADOR'),
  }),
});
