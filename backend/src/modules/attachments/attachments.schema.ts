import { z } from 'zod';

export const uploadAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID da solicitação inválido'),
  }),
  body: z.object({
    tipoArquivo: z.enum(['application/pdf', 'image/jpeg', 'image/png'], {
      errorMap: () => ({ message: 'Tipo de arquivo não permitido (Apenas PDF, JPG, PNG)' })
    }).optional(),
  }),
});
