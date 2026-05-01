import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

const getErrorName = (statusCode: number) => {
  switch (statusCode) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    default: return 'Internal Server Error';
  }
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
    return res.status(400).json({
      message: 'Validation failed',
      statusCode: 400,
      error: 'Bad Request',
      details: err.issues,
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal server error',
    statusCode: 500,
    error: 'Internal Server Error',
  });
};
