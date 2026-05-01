import { Router } from 'express';
import { login, register } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { loginSchema, registerSchema } from './auth.schema';

const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), login);
authRoutes.post('/register', validate(registerSchema), register);

export { authRoutes };
