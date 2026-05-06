import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

const getErrorName = (statusCode: number) => {
  const errors: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return errors[statusCode] || 'Error';
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      error: getErrorName(err.statusCode),
    });
  }

  if (err instanceof ZodError) {
    // Pegar a primeira mensagem de erro para ser o "message" principal
    const mainMessage = err.errors[0]?.message || 'Falha na validação dos dados';
    
    return res.status(400).json({
      message: mainMessage,
      statusCode: 400,
      error: 'Bad Request',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      })),
    });
  }

  console.error('[Internal Error]:', err);

  return res.status(500).json({
    message: 'Ocorreu um erro interno no servidor',
    statusCode: 500,
    error: 'Internal Server Error',
  });
};
