import type { Category, CreateCategoryInput } from '../domain/category/entity.js';

export interface CategoryService {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
}
