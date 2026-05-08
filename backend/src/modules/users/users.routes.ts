import { Router } from 'express';
import { getUsers, getMe, updateUser } from './users.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { patchUserSchema } from './users.schema';
import { Perfil } from '@prisma/client';

const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', getMe);
usersRoutes.get('/', authorize([Perfil.ADMIN]), getUsers);
usersRoutes.patch('/:id', authorize([Perfil.ADMIN]), validate(patchUserSchema), updateUser);

export { usersRoutes };
