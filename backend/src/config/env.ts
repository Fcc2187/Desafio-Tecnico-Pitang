import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_fallback',
};

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not found in .env, using fallback.');
}
