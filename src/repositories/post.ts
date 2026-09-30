import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';

const posts: Post[] = [];

export function createPostRepository(): Repository {
  return {
    getAll(category?: string, take?: number): Post[] {
      const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;
      return take ? filteredPosts.slice(0, take) : filteredPosts;
    },

    getById(id: number): Post | undefined {
      return posts.find((post) => post.id === id);
    },

    addPost(post: CreatePostInput): Promise<Post> {
      const newPost: Post = { id: posts.length ? Math.max(...posts.map(({ id }) => id)) + 1 : 1, ...post };
      posts.push(newPost);
      return Promise.resolve(newPost);
    }
  };
}
