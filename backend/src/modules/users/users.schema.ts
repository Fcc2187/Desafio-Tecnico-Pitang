import { z } from 'zod';
import { Perfil } from '@prisma/client';

export const patchUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
    perfil: z.nativeEnum(Perfil, { errorMap: () => ({ message: 'Perfil inválido' }) }).optional(),
  }),
});
