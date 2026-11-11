import type { CreatePostInput, Post } from '../domain/post/entity.js';

export interface PostService {
	getPosts(category?: string, take?: number): Post[];
	getPostById(id: number): Post | undefined;
	createPost(post: CreatePostInput): Promise<Post>;
}