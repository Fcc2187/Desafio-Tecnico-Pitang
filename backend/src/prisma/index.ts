import { PrismaClient } from '@prisma/client';
import '../config/env'; // Garante o carregamento das variáveis


export const prisma = new PrismaClient();
