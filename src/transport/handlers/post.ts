import type { Request, Response } from 'express';
import postService from '../../services/post.js';
import type { CreatePostRequest, GetPostsQuery, PostParams } from '../dto/post/requests.js';
import type { ErrorResponse } from '../dto/post/errors.js';
import type { Post, PostListResponse } from '../dto/post/responces.js';

export function getPosts(req: Request<Record<string, never>, PostListResponse | ErrorResponse, never, GetPostsQuery>, res: Response<PostListResponse | ErrorResponse>): Response<PostListResponse | ErrorResponse> {
  const take = postService.parseTake(req.query.take);
  if (take === null) return res.status(400).json({ error: 'take must be a positive integer' });

  if (req.query.category !== undefined && !req.query.category.trim()) return res.status(400).json({ error: 'category must not be empty' });
  
  return res.json(postService.getPosts(req.query.category, take));
}

export function getPostById(req: Request<PostParams>, res: Response<Post | ErrorResponse>): Response<Post | ErrorResponse> {
  const id = postService.parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id must be a positive integer' });
  
  const post = postService.getPostById(id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  return res.json(post);
}

export async function createPost(req: Request<Record<string, never>, Post | ErrorResponse, CreatePostRequest>, res: Response<Post | ErrorResponse>): Promise<Response<Post | ErrorResponse>> {
  const validationError = postService.validatePost(req.body);
  if (validationError) return res.status(422).json({ error: validationError });

  const post = await postService.createPost({
    title: req.body.title.trim(), content: req.body.content.trim(), author: req.body.author.trim(), category: req.body.category.trim(),
  });

  return res.status(201).json(post);
}