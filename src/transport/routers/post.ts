import { Router } from 'express';
import type { PostHandlers } from '../handlers/post.js';

export function createPostRouter(handlers: PostHandlers): Router {
	const postRouter = Router();
	postRouter.get('/posts', handlers.getPosts);
	postRouter.get('/posts/:id', handlers.getPostById);
	postRouter.post('/posts', handlers.createPost);

	return postRouter;
}