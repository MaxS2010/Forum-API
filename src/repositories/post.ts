import type { CreatePostInput, Post } from '../domain/post/entity.js';
import type { Repository } from '../domain/post/repository.js';
import type { db } from '../prisma/db.js';
import { getPostgresSqlState } from '../shared/database-errors.js';
import { ApiError } from '../shared/errors.js';

type PrismaDb = typeof db;

export function createPostRepository(database: PrismaDb): Repository {
  return {
    async getAll({ category, categoryId, take }): Promise<Post[]> {
      let filterCategoryId = categoryId;
      if (category !== undefined) {
        const matchingCategory = await database.orm.public.Category.where({ name: category }).first();
        if (!matchingCategory) return [];
        if (filterCategoryId !== undefined && filterCategoryId !== matchingCategory.id) return [];
        filterCategoryId = matchingCategory.id;
      }

      let posts = database.orm.public.Post
        .include('category')
        .orderBy((post) => post.id.asc());

      if (filterCategoryId !== undefined) posts = posts.where({ categoryId: filterCategoryId });
      if (take !== undefined) posts = posts.limit(take);

      return posts.all();
    },

    async getById(id: number): Promise<Post | undefined> {
      return (await database.orm.public.Post
        .where({ id })
        .include('category')
        .first()) ?? undefined;
    },

    async addPost(post: CreatePostInput): Promise<Post> {
      try {
        return await database.orm.public.Post
          .include('category')
          .create({
            title: post.title,
            content: post.content,
            author: post.author,
            category: (relation) => relation.connect({ id: post.categoryId }),
          });
      } catch (error) {
        if (getPostgresSqlState(error) === '23503' || isMissingCategory(error)) {
          throw new ApiError(404, 'Category not found');
        }

        throw error;
      }
    },
  };
}

function isMissingCategory(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ORM.RELATION_ROW_MISSING') {
    return false;
  }

  if (!('meta' in error) || !error.meta || typeof error.meta !== 'object') return false;
  return 'kind' in error.meta && error.meta.kind === 'connect' &&
    'relation' in error.meta && error.meta.relation === 'category';
}
