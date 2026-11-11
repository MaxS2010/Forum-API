import type { Category, CreateCategoryInput } from '../domain/category/entity.js';
import type { Repository } from '../domain/category/repository.js';
import type { db } from '../prisma/db.js';
import { getPostgresSqlState } from '../shared/database-errors.js';
import { ApiError } from '../shared/errors.js';

type PrismaDb = typeof db;

export function createCategoryRepository(database: PrismaDb): Repository {
  return {
    async getAll(): Promise<Category[]> {
      return database.orm.public.Category
        .orderBy((category) => category.id.asc())
        .all();
    },

    async getById(id: number): Promise<Category | undefined> {
      return (await database.orm.public.Category.first({ id })) ?? undefined;
    },

    async add(input: CreateCategoryInput): Promise<Category> {
      try {
        return await database.orm.public.Category.create(input);
      } catch (error) {
        if (getPostgresSqlState(error) === '23505') {
          throw new ApiError(409, 'Category name already exists');
        }

        throw error;
      }
    },
  };
}
