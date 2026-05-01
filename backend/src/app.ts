import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return res.json({ status: 'ok', timestamp: new Date() });
});

import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { categoriesRoutes } from './modules/categories/categories.routes';
import { reimbursementRoutes } from './modules/reimbursements/reimbursements.routes';
import { attachmentsRoutes } from './modules/attachments/attachments.routes';
import { historyRoutes } from './modules/history/history.routes';

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/categories', categoriesRoutes);
app.use('/reimbursements', reimbursementRoutes);
app.use('/reimbursements', attachmentsRoutes);
app.use('/reimbursements', historyRoutes);

app.use(errorHandler);

export { app };
