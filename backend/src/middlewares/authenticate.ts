import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { Perfil } from '@prisma/client';
import { config } from '../config/env';

export interface TokenPayload {
  id: string;
  perfil: Perfil;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded as TokenPayload;
    return next();
  } catch (err) {
    throw new AppError('Token JWT inválido ou expirado', 401);
  }
};
