import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';
import type { PostService } from './post.types.js';

export function createPostService(postRepository: Repository): PostService {
  return {
    getPosts(filters: { category?: string; categoryId?: number; take?: number }): Promise<Post[]> {
      return postRepository.getAll(filters);
    },
    getPostById(id: number): Promise<Post | undefined> {
      return postRepository.getById(id);
    },
    createPost(post: CreatePostInput): Promise<Post> {
      return postRepository.addPost(post);
    },
  };
}