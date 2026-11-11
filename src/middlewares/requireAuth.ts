import type { RequestHandler } from 'express';
import type { AccessTokenPayload } from '../lib/jwt.js';
import { ApiError } from '../shared/errors.js';

export function createRequireAuth(
  verifyToken: (token: string) => Promise<AccessTokenPayload | undefined>,
): RequestHandler {
  return async (req, _res, next) => {
    const token: unknown = req.cookies?.accessToken;
    if (typeof token !== 'string' || !token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = await verifyToken(token);
    if (!payload) throw new ApiError(401, 'Invalid or expired access token');

    req.auth = payload;
    next();
  };
}
