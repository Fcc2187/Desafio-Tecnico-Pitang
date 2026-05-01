import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';

export const getHistory = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id } });

  if (!reimbursement) throw new AppError('Solicitação não encontrada', 404);

  const history = await prisma.reimbursementHistory.findMany({
    where: { solicitacaoId: id },
    include: {
      usuario: { select: { nome: true, perfil: true } }
    },
    orderBy: { criadoEm: 'desc' },
  });

  res.json(history);
};
