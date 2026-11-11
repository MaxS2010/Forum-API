import express from 'express';
import { db } from './prisma/db.js';
import { createCategoryRepository } from './repositories/category.js';
import { createPostRepository } from './repositories/post.js';
import { createCategoryService } from './services/category.js';
import { createPostService } from './services/post.js';
import { createCategoryHandlers } from './transport/handlers/category.js';
import { errorHandler } from './transport/handlers/errors.js';
import { createPostHandlers } from './transport/handlers/post.js';
import { createCategoryRouter } from './transport/routers/category.js';
import { createPostRouter } from './transport/routers/post.js';

const HOST: string = 'localhost';
const PORT: number = 8000;

const app = express();
const postRepository = createPostRepository(db);
const categoryRepository = createCategoryRepository(db);
const postService = createPostService(postRepository);
const categoryService = createCategoryService(categoryRepository);
const postHandlers = createPostHandlers(postService);
const categoryHandlers = createCategoryHandlers(categoryService);
const postRouter = createPostRouter(postHandlers);
const categoryRouter = createCategoryRouter(categoryHandlers);

app.use(express.json());
app.use(postRouter);
app.use(categoryRouter);
app.use(errorHandler);

export default app;

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});