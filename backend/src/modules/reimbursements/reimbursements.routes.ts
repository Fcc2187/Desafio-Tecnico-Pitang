import { Router } from 'express';
import * as controller from './reimbursements.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { attachmentsRoutes } from '../attachments/attachments.routes';
import { validate } from '../../middlewares/validate';
import { 
  createReimbursementSchema, 
  updateReimbursementSchema, 
  rejectReimbursementSchema,
  idParamSchema
} from './reimbursements.schema';
import { Perfil } from '@prisma/client';

const routes = Router();

routes.use(authenticate);

routes.get('/', controller.listReimbursements);
routes.get('/stats', controller.getDashboardStats);

routes.get('/:id', validate(idParamSchema), controller.getReimbursementDetail);

routes.post(
  '/', 
  authorize([Perfil.COLABORADOR]), 
  validate(createReimbursementSchema), 
  controller.createReimbursement
);

routes.put(
  '/:id', 
  authorize([Perfil.COLABORADOR]), 
  validate(updateReimbursementSchema), 
  controller.updateReimbursement
);

routes.post(
  '/:id/submit', 
  authorize([Perfil.COLABORADOR]), 
  validate(idParamSchema), 
  controller.submitReimbursement
);

routes.post(
  '/:id/approve', 
  authorize([Perfil.GESTOR]), 
  validate(idParamSchema), 
  controller.approveReimbursement
);

routes.post(
  '/:id/reject', 
  authorize([Perfil.GESTOR]), 
  validate(rejectReimbursementSchema), 
  controller.rejectReimbursement
);

routes.post(
  '/:id/pay', 
  authorize([Perfil.FINANCEIRO]), 
  validate(idParamSchema), 
  controller.payReimbursement
);

routes.post(
  '/:id/cancel', 
  authorize([Perfil.COLABORADOR]), 
  validate(idParamSchema), 
  controller.cancelReimbursement
);

routes.get('/:id/history', validate(idParamSchema), controller.getReimbursementHistory);

routes.use('/:id/attachments', attachmentsRoutes);

export { routes as reimbursementRoutes };
