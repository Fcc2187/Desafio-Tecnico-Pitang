import { PrismaClient } from '@prisma/client';
import '../config/env';


export const prisma = new PrismaClient();
