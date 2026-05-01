import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Perfil } from '@prisma/client';

export const authorize = (perfis: Perfil[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!perfis.includes(req.user.perfil)) {
      throw new AppError('Acesso negado: Perfil sem permissão para esta ação', 403);
    }

    return next();
  };
};
