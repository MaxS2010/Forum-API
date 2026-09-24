import postRepository from '../repositories/post.js';
import type { CreatePostRequest } from '../transport/dto/post/requests.js';
import type { Post } from '../transport/dto/post/responces.js';

const requiredPostFields: Array<keyof CreatePostRequest> = ['title', 'content', 'author', 'category'];

function validatePost(body: unknown): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Request body must be an object';

  const post = body as Record<string, unknown>;

  for (const field of requiredPostFields) {
    if (typeof post[field] !== 'string' || !post[field].trim()) return `${field} must be a non-empty string`;
  }
  
  return null;
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

function getPosts(category?: string, take?: number): Post[] { 
    return postRepository.getAll(category, take); 
}

function getPostById(id: number): Post | undefined { 
    return postRepository.getById(id); 
}

function createPost(post: CreatePostRequest): Promise<Post> { 
    return postRepository.addPost(post); 
}

export { createPost, getPostById, getPosts, parseId, parseTake, validatePost };
export default { createPost, getPostById, getPosts, parseId, parseTake, validatePost };