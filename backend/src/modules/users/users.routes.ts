import { Router } from 'express';
import { getUsers, getMe } from './users.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { Perfil } from '@prisma/client';

const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', getMe);
usersRoutes.get('/', authorize([Perfil.ADMIN]), getUsers);

export { usersRoutes };
