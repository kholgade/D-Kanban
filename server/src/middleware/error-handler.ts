import type { Express, Request, Response, NextFunction } from 'express';
import { createLogger } from '../lib/logger.js';

const log = createLogger('error-handler');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof Error) {
    log.error({ err }, 'Unexpected error');
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }

  log.error({ err }, 'Unknown error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}

export function attachErrorHandler(app: Express) {
  app.use(errorHandler);
}
