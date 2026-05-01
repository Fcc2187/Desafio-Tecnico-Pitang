import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';
import { Perfil, ReimbursementStatus, HistoryAction, Prisma } from '@prisma/client';

export const createReimbursement = async (req: Request, res: Response) => {
  const { categoriaId, descricao, valor, dataDespesa } = req.body;
  const solicitanteId = req.user!.id;

  const category = await prisma.category.findUnique({ where: { id: categoriaId } });

  if (!category || !category.ativo) {
    throw new AppError('Categoria não encontrada ou inativa', 400);
  }

  const reimbursement = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const item = await tx.reimbursement.create({
      data: {
        solicitanteId,
        categoriaId,
        descricao,
        valor,
        dataDespesa: new Date(dataDespesa),
        status: ReimbursementStatus.RASCUNHO,
      },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: item.id,
        usuarioId: solicitanteId,
        acao: HistoryAction.CREATED,
        observacao: 'Solicitação criada em modo rascunho',
      },
    });

    return item;
  });

  res.status(201).json(reimbursement);
};

export const listReimbursements = async (req: Request, res: Response) => {
  const { id, perfil } = req.user!;

  let where = {};

  //se for colaborador, vê apenas os dele
  if (perfil === Perfil.COLABORADOR) {
    where = { solicitanteId: id };
  } 
  //se for financeiro, só vê os aprovados ou pagos
  else if (perfil === Perfil.FINANCEIRO) {
    where = { status: { in: [ReimbursementStatus.APROVADO, ReimbursementStatus.PAGO] } };
  }
  //gestor e Admin veem todos

  const items = await prisma.reimbursement.findMany({
    where,
    include: {
      solicitante: { select: { nome: true, email: true } },
      categoria: { select: { nome: true } },
    },
    orderBy: { criadoEm: 'desc' },
  });

  res.json(items);
};

export const getReimbursementDetail = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const perfil = req.user!.perfil;

  const item = await prisma.reimbursement.findUnique({
    where: { id },
    include: {
      solicitante: { select: { nome: true, email: true } },
      categoria: { select: { nome: true } },
      history: {
        include: { usuario: { select: { nome: true, perfil: true } } },
        orderBy: { criadoEm: 'desc' },
      },
      attachments: true,
    },
  });

  if (!item) throw new AppError('Solicitação não encontrada', 404);

  if (perfil === Perfil.COLABORADOR && item.solicitanteId !== userId) {
    throw new AppError('Acesso negado', 403);
  }

  res.json(item);
};

export const updateReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const { categoriaId, descricao, valor, dataDespesa } = req.body;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);
  if (item.status !== ReimbursementStatus.RASCUNHO) throw new AppError('Apenas rascunhos podem ser editados', 400);

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const res = await tx.reimbursement.update({
      where: { id },
      data: {
        categoriaId,
        descricao,
        valor,
        dataDespesa: dataDespesa ? new Date(dataDespesa) : undefined,
      },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.UPDATED,
        observacao: 'Dados do rascunho atualizados',
      },
    });

    return res;
  });

  res.json(updated);
};

export const submitReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);
  if (item.status !== ReimbursementStatus.RASCUNHO) throw new AppError('Apenas rascunhos podem ser enviados', 400);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.reimbursement.update({
      where: { id },
      data: { status: ReimbursementStatus.ENVIADO },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.SUBMITTED,
        observacao: 'Solicitação enviada para análise do gestor',
      },
    });
  });

  res.json({ message: 'Solicitação enviada com sucesso' });
};

export const approveReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.status !== ReimbursementStatus.ENVIADO) throw new AppError('Apenas solicitações enviadas podem ser aprovadas', 400);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.reimbursement.update({
      where: { id },
      data: { status: ReimbursementStatus.APROVADO },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.APPROVED,
        observacao: 'Solicitação aprovada pelo gestor',
      },
    });
  });

  res.json({ message: 'Solicitação aprovada' });
};

export const rejectReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const { justificativaRejeicao } = req.body;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.status !== ReimbursementStatus.ENVIADO) throw new AppError('Apenas solicitações enviadas podem ser rejeitadas', 400);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.reimbursement.update({
      where: { id },
      data: { 
        status: ReimbursementStatus.REJEITADO,
        justificativaRejeicao
      },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.REJECTED,
        observacao: `Solicitação rejeitada. Motivo: ${justificativaRejeicao}`,
      },
    });
  });

  res.json({ message: 'Solicitação rejeitada' });
};

export const payReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.status !== ReimbursementStatus.APROVADO) throw new AppError('Apenas solicitações aprovadas podem ser pagas', 400);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.reimbursement.update({
      where: { id },
      data: { status: ReimbursementStatus.PAGO },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.PAID,
        observacao: 'Pagamento confirmado pelo financeiro',
      },
    });
  });

  res.json({ message: 'Solicitação marcada como paga' });
};

export const cancelReimbursement = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const item = await prisma.reimbursement.findUnique({ where: { id } });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);
  
  if (!([ReimbursementStatus.RASCUNHO, ReimbursementStatus.ENVIADO] as ReimbursementStatus[]).includes(item.status)) {
    throw new AppError('Esta solicitação não pode mais ser cancelada', 400);
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.reimbursement.update({
      where: { id },
      data: { status: ReimbursementStatus.CANCELADO },
    });

    await tx.reimbursementHistory.create({
      data: {
        solicitacaoId: id,
        usuarioId: userId,
        acao: HistoryAction.CANCELED,
        observacao: 'Solicitação cancelada pelo colaborador',
      },
    });
  });

  res.json({ message: 'Solicitação cancelada' });
};
