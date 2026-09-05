import type { NextFunction, Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { toApiError } from '../lib/apiErrors';

/** 404 handler for unknown routes — wrapped in the §2.6 error envelope. */
export function notFound(req: Request, res: Response): void {
  res.status(404).json(
    envelope.fail({
      code: 'RESOURCE_NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    } as never),
  );
}

/** Express catch-all error handler — always returns the §2.6 error shape. */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) return void next(err);
  const apiErr = toApiError(err);
  if (apiErr.code === 'INTERNAL_ERROR') {
    console.error('[error]', apiErr.message, apiErr.stack ?? '');
  }
  res.status(apiErr.status).json(envelope.fail(apiErr));
}