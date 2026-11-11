import type { RequestHandler } from 'express';
import type { PostService } from '../../services/post.types.js';
import { ApiError } from '../../shared/errors.js';
import type { ErrorResponse } from '../dto/post/errors.js';
import type { CreatePostRequest, GetPostsQuery, PostParams } from '../dto/post/requests.js';
import type { Post, PostListResponse } from '../dto/post/responses.js';

export interface PostHandlers {
  getPosts: RequestHandler<Record<string, never>, PostListResponse | ErrorResponse, never, GetPostsQuery>;
  getPostById: RequestHandler<PostParams, Post | ErrorResponse>;
  createPost: RequestHandler<Record<string, never>, Post | ErrorResponse, CreatePostRequest>;
}

export function createPostHandlers(postService: PostService): PostHandlers {
  return {
    async getPosts(req, res) {
      const take = parsePositiveInteger(req.query.take);
      if (take === null) throw new ApiError(400, 'take must be a positive integer');

      if (req.query.category !== undefined && (typeof req.query.category !== 'string' || !req.query.category.trim())) {
        throw new ApiError(400, 'category must not be empty');
      }

      const categoryId = parsePositiveInteger(req.query.categoryId);
      if (categoryId === null) throw new ApiError(400, 'categoryId must be a positive integer');

      const posts = await postService.getPosts({
        ...(req.query.category === undefined ? {} : { category: req.query.category.trim() }),
        ...(categoryId === undefined ? {} : { categoryId }),
        ...(take === undefined ? {} : { take }),
      });

      return res.json(posts);
    },

    async getPostById(req, res) {
      const id = parsePositiveInteger(req.params.id);
      if (id === null || id === undefined) throw new ApiError(400, 'id must be a positive integer');

      const post = await postService.getPostById(id);
      if (!post) throw new ApiError(404, 'Post not found');

      return res.json(post);
    },

    async createPost(req, res) {
      const input = parseCreatePost(req.body);
      const post = await postService.createPost(input);
      return res.status(201).json(post);
    },
  };
}

function parsePositiveInteger(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseCreatePost(body: unknown): CreatePostRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(422, 'Request body must be an object');
  }

  const post = body as Record<string, unknown>;
  const allowedFields = ['title', 'content', 'author', 'categoryId'];
  if (Object.keys(post).some((field) => !allowedFields.includes(field))) {
    throw new ApiError(422, 'Request contains invalid fields');
  }

  const { title, content, author, categoryId } = post;
  if (typeof title !== 'string' || !title.trim()) throw new ApiError(422, 'title must be a non-empty string');
  if (typeof content !== 'string' || !content.trim()) throw new ApiError(422, 'content must be a non-empty string');
  if (typeof author !== 'string' || !author.trim()) throw new ApiError(422, 'author must be a non-empty string');

  if (categoryId === undefined) throw new ApiError(422, 'categoryId is required');
  if (typeof categoryId !== 'number' || !Number.isInteger(categoryId) || categoryId < 1) {
    throw new ApiError(400, 'categoryId must be a positive integer');
  }

  return {
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    categoryId,
  };
}
