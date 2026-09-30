import express from 'express';
import { createPostRepository } from './repositories/post.js';
import { createPostService } from './services/post.js';
import { createPostHandlers } from './transport/handlers/post.js';
import { createPostRouter } from './transport/routers/post.js';

const HOST: string = 'localhost';
const PORT: number = 8000;

const app = express();
const postRepository = createPostRepository();
const postService = createPostService(postRepository);
const postHandlers = createPostHandlers(postService);
const postRouter = createPostRouter(postHandlers);

app.use(express.json());
app.use(postRouter);

export default app;

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});