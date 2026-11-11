import express from 'express';
import cookieParser from 'cookie-parser';
import { db } from './prisma/db.js';
import { createCategoryRepository } from './repositories/category.js';
import { createPostRepository } from './repositories/post.js';
import { createUserRepository } from './repositories/user.js';
import { createCategoryService } from './services/category.js';
import { createPostService } from './services/post.js';
import { createAuthService } from './services/auth/auth.js';
import { hashPassword, verifyPassword } from './lib/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './lib/jwt.js';
import { createRequireAuth } from './middlewares/requireAuth.js';
import { createCategoryHandlers } from './transport/handlers/category.js';
import { errorHandler } from './transport/handlers/errors.js';
import { createPostHandlers } from './transport/handlers/post.js';
import { createAuthHandlers } from './transport/handlers/auth.js';
import { createCategoryRouter } from './transport/routers/category.js';
import { createPostRouter } from './transport/routers/post.js';
import { createAuthRouter } from './transport/routers/auth.js';

const HOST: string = 'localhost';
const PORT: number = 8000;

const app = express();
const postRepository = createPostRepository(db);
const categoryRepository = createCategoryRepository(db);
const userRepository = createUserRepository(db);
const postService = createPostService(postRepository);
const categoryService = createCategoryService(categoryRepository);
const authService = createAuthService(
  userRepository,
  { hash: hashPassword, verify: verifyPassword },
  { signAccessToken, signRefreshToken, verifyRefreshToken },
);
const postHandlers = createPostHandlers(postService);
const categoryHandlers = createCategoryHandlers(categoryService);
const authHandlers = createAuthHandlers(authService, postService);
const postRouter = createPostRouter(postHandlers);
const categoryRouter = createCategoryRouter(categoryHandlers);
const requireAuth = createRequireAuth(verifyAccessToken);
const authRouter = createAuthRouter(authHandlers, requireAuth);

app.use(express.json());
app.use(cookieParser());
app.use(postRouter);
app.use(categoryRouter);
app.use(authRouter);
app.use(errorHandler);

export default app;

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});