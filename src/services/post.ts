import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';
import type { PostService } from './post.types.js';

export function createPostService(postRepository: Repository): PostService {
  return {
    getPosts(category?: string, take?: number): Post[] {
      return postRepository.getAll(category, take);
    },
    getPostById(id: number): Post | undefined {
      return postRepository.getById(id);
    },
    createPost(post: CreatePostInput): Promise<Post> {
      return postRepository.addPost(post);
    },
  };
}