import { Router } from 'express';
import type { UserHandlers } from '../handlers/user.js';
import { requireAuth } from '../middleware/require-auth.js';

export function createUserRouter(handlers: UserHandlers): Router {
  const userRouter = Router();
  userRouter.post('/auth/register', handlers.register);
  userRouter.post('/auth/login', handlers.login);
  userRouter.post('/auth/logout', handlers.logout);
  userRouter.get('/me', requireAuth, handlers.me);
  userRouter.get('/me/posts', requireAuth, handlers.getOwnPosts);

  return userRouter;
}
