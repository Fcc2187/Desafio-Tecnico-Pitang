import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { AppError } from '../../utils/AppError';
import { config as env } from '../../env';

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(senha, user.senha);

  if (!isPasswordValid) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const token = jwt.sign(
    { id: user.id, perfil: user.perfil },
    env.jwtSecret,
    { expiresIn: '1d' }
  );

  res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
};

export const register = async (req: Request, res: Response) => {
  const { nome, email, senha, perfil } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    throw new AppError('Email já está em uso', 400);
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = await prisma.user.create({
    data: {
      nome,
      email,
      senha: hashedPassword,
      perfil: perfil || 'COLABORADOR',
    },
  });

  res.status(201).json({
    message: 'Usuário criado com sucesso',
    user: { id: newUser.id, nome: newUser.nome, email: newUser.email, perfil: newUser.perfil },
  });
};
