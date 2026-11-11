import type { CreatePostInput, Post } from '../domain/post/entity.js';

export interface PostService {
  getPosts(filters: { category?: string; categoryId?: number; take?: number }): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: CreatePostInput): Promise<Post>;
}