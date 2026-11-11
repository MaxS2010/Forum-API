import type { RequestHandler } from 'express';
import type { PostService } from '../../services/post.types.js';
import type { CreatePostRequest, GetPostsQuery, PostParams } from '../dto/post/requests.js';
import type { ErrorResponse } from '../dto/post/errors.js';
import type { Post, PostListResponse } from '../dto/post/responces.js';

export interface PostHandlers {
  getPosts: RequestHandler<Record<string, never>, PostListResponse | ErrorResponse, never, GetPostsQuery>;
  getPostById: RequestHandler<PostParams, Post | ErrorResponse>;
  createPost: RequestHandler<Record<string, never>, Post | ErrorResponse, CreatePostRequest>;
}

export function createPostHandlers(postService: PostService): PostHandlers {
  return {
    getPosts(req, res) {
      const take = parseTake(req.query.take);
      if (take === null) return res.status(400).json({ error: 'take must be a positive integer' });

      if (req.query.category !== undefined && !req.query.category.trim()) return res.status(400).json({ error: 'category must not be empty' });

      return res.json(postService.getPosts(req.query.category, take));
    },

    getPostById(req, res) {
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ error: 'id must be a positive integer' });

      const post = postService.getPostById(id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      return res.json(post);
    },

    async createPost(req, res) {
      const parsedPost = parseCreatePost(req.body);
      if ('error' in parsedPost) return res.status(422).json({ error: parsedPost.error });

      const post = await postService.createPost(parsedPost.data);
      return res.status(201).json(post);
    },
  };
}
  
function parseTake(value?: string): number | null | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(Number(value)) || Number(value) < 1) return null;

  return Number(value);
}

function parseId(value: string): number | null {
  if (!Number.isInteger(Number(value)) || Number(value) < 1) return null;

  return Number(value);
}

function parseCreatePost(body: unknown): { data: CreatePostRequest } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Request body must be an object' };

  const post = body as Record<string, unknown>;
  const title = post.title;
  if (typeof title !== 'string' || !title.trim()) return { error: 'title must be a non-empty string' };

  const content = post.content;
  if (typeof content !== 'string' || !content.trim()) return { error: 'content must be a non-empty string' };

  const author = post.author;
  if (typeof author !== 'string' || !author.trim()) return { error: 'author must be a non-empty string' };

  const category = post.category;
  if (typeof category !== 'string' || !category.trim()) return { error: 'category must be a non-empty string' };

  return {
    data: {
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category.trim(),
    },
  };
}