import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../../config/upload';
import { uploadAttachment, getAttachments } from './attachments.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { idParamSchema } from '../reimbursements/reimbursements.schema';
import { Perfil } from '@prisma/client';

const attachmentsRoutes = Router({ mergeParams: true });
const upload = multer(uploadConfig);

attachmentsRoutes.use(authenticate);

attachmentsRoutes.get('/', validate(idParamSchema), getAttachments);
attachmentsRoutes.post(
  '/', 
  authorize([Perfil.COLABORADOR]), 
  upload.single('file'),
  uploadAttachment
);

export { attachmentsRoutes };
