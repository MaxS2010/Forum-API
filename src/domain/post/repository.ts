import type { CreatePostInput, Post } from './entity.js';

export interface Repository {
  getAll(filters: { category?: string; categoryId?: number; authorId?: number; take?: number }): Promise<Post[]>;
  getById(id: number): Promise<Post | undefined>;
  addPost(post: CreatePostInput): Promise<Post>;
}