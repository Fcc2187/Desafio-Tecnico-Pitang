import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';
import { Perfil, ReimbursementStatus, HistoryAction, Prisma } from '@prisma/client';

export const createReimbursement = async (req: Request, res: Response) => {
  const { categoriaId, descricao, valor, dataDespesa, attachments } = req.body;
  const solicitanteId = req.user!.id;

  const category = await prisma.category.findUnique({ where: { id: categoriaId } });

  if (!category || !category.ativo) {
    throw new AppError('Categoria não encontrada ou inativa', 400);
  }

  if (category.limiteValor && valor > Number(category.limiteValor)) {
    throw new AppError(`O valor excede o limite permitido para esta categoria (Máx: R$ ${Number(category.limiteValor).toFixed(2)})`, 400);
  }

  const reimbursement = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const item = await tx.reimbursement.create({
      data: {
        solicitanteId,
        categoriaId,
        descricao,
        valor,
        dataDespesa: dayjs(dataDespesa).toDate(),
        status: ReimbursementStatus.RASCUNHO,
        attachments: attachments ? {
          create: attachments.map((a: any) => ({
            nomeArquivo: a.nomeArquivo,
            urlArquivo: a.urlArquivo,
            tipoArquivo: a.tipoArquivo,
          })),
        } : undefined,
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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { status, categoriaId, colaborador, sortField, sortOrder } = req.query;

  let where: any = {};

  if (perfil === Perfil.COLABORADOR) {
    where.solicitanteId = id;
  } else if (perfil === Perfil.FINANCEIRO) {
    where.status = { in: [ReimbursementStatus.APROVADO, ReimbursementStatus.PAGO] };
  }

  if (status) {
    where.status = status as string;
  }
  if (categoriaId) {
    where.categoriaId = categoriaId as string;
  }
  if (colaborador) {
    where.solicitante = {
      nome: { contains: colaborador as string, mode: 'insensitive' }
    };
  }

  // Ordenação dinâmica
  const orderByField = (sortField as string) || 'criadoEm';
  const orderDirection = (sortOrder as string) || 'desc';

  const [items, total] = await Promise.all([
    prisma.reimbursement.findMany({
      where,
      include: {
        solicitante: { select: { nome: true, email: true } },
        categoria: { select: { nome: true } },
      },
      orderBy: { [orderByField]: orderDirection },
      skip,
      take: limit,
    }),
    prisma.reimbursement.count({ where }),
  ]);

  res.json({
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  });
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

  const item = await prisma.reimbursement.findUnique({
    where: { id },
    include: { attachments: true },
  });

  if (!item) throw new AppError('Solicitação não encontrada', 404);
  if (item.solicitanteId !== userId) throw new AppError('Ação permitida apenas para o dono', 403);
  if (item.status !== ReimbursementStatus.RASCUNHO) throw new AppError('Apenas rascunhos podem ser editados', 400);

  const finalCategoryId = categoriaId || item.categoriaId;
  const finalValor = valor || item.valor;
  const incomingAttachments = req.body.attachments || [];
  const hasAttachments = item.attachments.length > 0 || incomingAttachments.length > 0;

  if (Number(finalValor) > 1000 && !hasAttachments) {
    throw new AppError('Comprovante obrigatório para valores acima de R$ 1.000,00', 400);
  }

  const category = await prisma.category.findUnique({ where: { id: finalCategoryId } });
  if (category?.limiteValor && Number(finalValor) > Number(category.limiteValor)) {
    throw new AppError(`O valor excede o limite permitido para esta categoria (Máx: R$ ${Number(category.limiteValor).toFixed(2)})`, 400);
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (req.body.attachments) {
      await tx.attachment.deleteMany({ where: { solicitacaoId: id } });
    }

    const res = await tx.reimbursement.update({
      where: { id },
      data: {
        categoriaId,
        descricao,
        valor,
        dataDespesa: dataDespesa ? dayjs(dataDespesa).toDate() : undefined,
        attachments: req.body.attachments ? {
          create: req.body.attachments.map((a: any) => ({
            nomeArquivo: a.nomeArquivo,
            urlArquivo: a.urlArquivo,
            tipoArquivo: a.tipoArquivo,
          })),
        } : undefined,
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

export const getDashboardStats = async (req: Request, res: Response) => {
  const { id, perfil } = req.user!;
  
  const where: any = {};
  if (perfil === Perfil.COLABORADOR) {
    where.solicitanteId = id;
  }

  const startOfMonth = dayjs().startOf('month').toDate();

  const [
    pendentes,
    aprovadasMes,
    totalPago,
    recentActivities
  ] = await Promise.all([
    prisma.reimbursement.count({
      where: { ...where, status: ReimbursementStatus.ENVIADO }
    }),
    prisma.reimbursement.aggregate({
      where: { 
        ...where, 
        status: ReimbursementStatus.APROVADO,
        criadoEm: { gte: startOfMonth }
      },
      _sum: { valor: true }
    }),
    prisma.reimbursement.aggregate({
      where: { ...where, status: ReimbursementStatus.PAGO },
      _sum: { valor: true }
    }),
    prisma.reimbursementHistory.findMany({
      where: { solicitacao: where },
      include: {
        solicitacao: { select: { id: true, descricao: true } },
        usuario: { select: { nome: true } }
      },
      orderBy: { criadoEm: 'desc' },
      take: 5
    })
  ]);

  res.json({
    stats: {
      pendentes,
      aprovadasMes: aprovadasMes._sum.valor || 0,
      totalPago: totalPago._sum.valor || 0,
    },
    recentActivities
  });
};
