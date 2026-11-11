import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../../services/access-token.js';
import { ApiError } from '../../shared/errors.js';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.accessToken;
  if (typeof token !== 'string' || !token) throw new ApiError(401, 'Authentication required');

  const payload = await verifyAccessToken(token);
  if (!payload) throw new ApiError(401, 'Invalid or expired access token');

  req.auth = payload;
  next();
};
