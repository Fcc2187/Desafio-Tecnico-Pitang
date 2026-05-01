import { Router } from 'express';
import { getHistory } from './history.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { idParamSchema } from '../reimbursements/reimbursements.schema';

const historyRoutes = Router({ mergeParams: true });

historyRoutes.use(authenticate);

historyRoutes.get('/:id/history', validate(idParamSchema), getHistory);

export { historyRoutes };
