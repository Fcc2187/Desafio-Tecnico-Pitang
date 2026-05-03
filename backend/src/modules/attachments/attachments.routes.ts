import { Router } from 'express';
import { uploadAttachment, getAttachments } from './attachments.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { uploadAttachmentSchema } from './attachments.schema';
import { idParamSchema } from '../reimbursements/reimbursements.schema';
import { Perfil } from '@prisma/client';

const attachmentsRoutes = Router({ mergeParams: true });

attachmentsRoutes.use(authenticate);

attachmentsRoutes.get('/', validate(idParamSchema), getAttachments);
attachmentsRoutes.post(
  '/', 
  authorize([Perfil.COLABORADOR]), 
  validate(uploadAttachmentSchema), 
  uploadAttachment
);

export { attachmentsRoutes };
