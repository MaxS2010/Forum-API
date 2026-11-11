import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';
import type { db } from '../prisma/db.js';
import { getPostgresSqlState } from '../shared/database-errors.js';
import { ApiError } from '../shared/errors.js';

type PrismaDb = typeof db;

export function createPostRepository(database: PrismaDb): Repository {
  return {
    async getAll({ category, categoryId, authorId, take }): Promise<Post[]> {
      let filterCategoryId = categoryId;
      if (category !== undefined) {
        const matchingCategory = await database.orm.public.Category.where({ name: category }).first();
        if (!matchingCategory) return [];
        if (filterCategoryId !== undefined && filterCategoryId !== matchingCategory.id) return [];
        filterCategoryId = matchingCategory.id;
      }

      let posts = database.orm.public.Post
        .include('category')
        .include('author', (author) => author.select('id', 'email', 'name'))
        .orderBy((post) => post.id.asc());

      if (filterCategoryId !== undefined) posts = posts.where({ categoryId: filterCategoryId });
      if (authorId !== undefined) posts = posts.where({ authorId });
      if (take !== undefined) posts = posts.limit(take);

      const results = await posts.all();
      return results.map(requireAuthor);
    },

    async getById(id: number): Promise<Post | undefined> {
      const post = await database.orm.public.Post
        .where({ id })
        .include('category')
        .include('author', (author) => author.select('id', 'email', 'name'))
        .first();
      if (!post) return undefined;
      return requireAuthor(post);
    },

    async addPost(post: CreatePostInput): Promise<Post> {
      try {
        const createdPost = await database.orm.public.Post
          .include('category')
          .include('author', (author) => author.select('id', 'email', 'name'))
          .create({
            title: post.title,
            content: post.content,
            author: (relation) => relation.connect({ id: post.authorId }),
            category: (relation) => relation.connect({ id: post.categoryId }),
          });
        return requireAuthor(createdPost);
      } catch (error) {
        if (getPostgresSqlState(error) === '23503' || isMissingRelation(error, 'category')) {
          throw new ApiError(404, 'Category not found');
        }
        if (isMissingRelation(error, 'author')) throw new ApiError(404, 'Author not found');

        throw error;
      }
    },
  };
}

function requireAuthor<T extends { id: number; author: Post['author'] | null }>(
  post: T,
): Omit<T, 'author'> & { author: Post['author'] } {
  const author = post.author;
  if (!author) throw new Error(`Post ${post.id} is missing its required author`);
  return { ...post, author };
}

function isMissingRelation(error: unknown, relationName: string): boolean {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ORM.RELATION_ROW_MISSING') {
    return false;
  }

  if (!('meta' in error) || !error.meta || typeof error.meta !== 'object') return false;
  return 'kind' in error.meta && error.meta.kind === 'connect' &&
    'relation' in error.meta && error.meta.relation === relationName;
}
