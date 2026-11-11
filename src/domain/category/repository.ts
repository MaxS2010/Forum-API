import type { Category, CreateCategoryInput } from './entity.js';

export interface Repository {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | undefined>;
  add(input: CreateCategoryInput): Promise<Category>;
}
