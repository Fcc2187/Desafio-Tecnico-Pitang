import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';

export const uploadAttachment = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const { nomeArquivo, urlArquivo, tipoArquivo } = req.body;

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });

  if (!reimbursement) throw new AppError('Solicitação não encontrada', 404);
  if (reimbursement.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);

  const attachment = await prisma.attachment.create({
    data: {
      solicitacaoId: id,
      nomeArquivo: nomeArquivo,
      urlArquivo: urlArquivo,
      tipoArquivo: tipoArquivo,
    },
  });

  res.status(201).json(attachment);
};

export const getAttachments = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });

  if (!reimbursement) throw new AppError('Solicitação não encontrada', 404);

  const attachments = await prisma.attachment.findMany({
    where: { solicitacaoId: id },
    orderBy: { criadoEm: 'desc' },
  });

  res.json(attachments);
};
