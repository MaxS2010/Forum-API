import { Router } from 'express';
import { createPost, getPostById, getPosts } from '../handlers/post.js';

const postRouter: Router = Router();
postRouter.get('/posts', getPosts);
postRouter.get('/posts/:id', getPostById);
postRouter.post('/posts', createPost);

export default postRouter;