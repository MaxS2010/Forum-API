import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../../shared/errors.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (isMalformedJsonError(error)) {
    return res.status(400).json({ error: 'Request body contains invalid JSON' });
  }

  console.error('Unhandled API error:', error);
  return res.status(500).json({ error: 'Internal server error' });
};

function isMalformedJsonError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'type' in error &&
    error.type === 'entity.parse.failed',
  );
}
