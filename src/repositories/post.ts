import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';
import type { db } from '../prisma/db.js';

type PrismaDb = typeof db;

export async function createPostRepository(database: PrismaDb): Promise<Repository> {
  const posts: Post[] = await database.orm.public.Post
    .select('id', 'title', 'content', 'author', 'category')
    .orderBy((post) => post.id.asc())
    .all();

  return {
    getAll(category?: string, take?: number): Post[] {
      const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;
      return take ? filteredPosts.slice(0, take) : filteredPosts;
    },

    getById(id: number): Post | undefined {
      return posts.find((post) => post.id === id);
    },

    async addPost(post: CreatePostInput): Promise<Post> {
      const newPost = await database.orm.public.Post.create(post);
      posts.push(newPost);
      return newPost;
    }
  };
}
