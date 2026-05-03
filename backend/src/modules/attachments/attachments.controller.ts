import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';
import { HistoryAction } from '@prisma/client';

export const uploadAttachment = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  
  if (!req.file) {
    throw new AppError('Arquivo é obrigatório', 400);
  }

  const { filename, originalname, mimetype } = req.file;
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const urlArquivo = `${baseUrl}/files/${filename}`;

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: String(id) } });

  if (!reimbursement) throw new AppError('Solicitação não encontrada', 404);
  if (reimbursement.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);

  const attachment = await prisma.$transaction(async (tx) => {
    const att = await tx.attachment.create({
      data: {
        solicitacaoId: String(id),
        nomeArquivo: originalname,
        urlArquivo: urlArquivo,
        tipoArquivo: mimetype.split('/')[0],
      },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: String(id),
        usuarioId: userId,
        acao: HistoryAction.UPDATED,
        observacao: `Anexo carregado: ${originalname}`,
      },
    });

    return att;
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
