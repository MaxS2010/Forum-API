import { Router, type RequestHandler } from 'express';
import type { AuthHandlers } from '../handlers/auth.js';

export function createAuthRouter(handlers: AuthHandlers, requireAuth: RequestHandler): Router {
  const authRouter = Router();
  authRouter.post('/auth/register', handlers.register);
  authRouter.post('/auth/login', handlers.login);
  authRouter.post('/auth/refresh', handlers.refresh);
  authRouter.post('/auth/logout', handlers.logout);
  authRouter.get('/me', requireAuth, handlers.me);
  authRouter.get('/me/posts', requireAuth, handlers.getOwnPosts);

  return authRouter;
}
