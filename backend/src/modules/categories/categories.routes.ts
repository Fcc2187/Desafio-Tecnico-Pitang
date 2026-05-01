import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from './categories.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from './categories.schema';
import { Perfil } from '@prisma/client';

const categoriesRoutes = Router();

categoriesRoutes.use(authenticate);

categoriesRoutes.get('/', getCategories);
categoriesRoutes.post('/', authorize([Perfil.ADMIN]), validate(createCategorySchema), createCategory);
categoriesRoutes.put('/:id', authorize([Perfil.ADMIN]), validate(updateCategorySchema), updateCategory);

export { categoriesRoutes };
