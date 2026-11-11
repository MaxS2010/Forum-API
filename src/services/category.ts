import type { CreateCategoryInput } from '../domain/category/entity.js';
import type { Repository } from '../domain/category/repository.js';
import type { CategoryService } from './category.types.js';

export function createCategoryService(categoryRepository: Repository): CategoryService {
  return {
    getCategories() {
      return categoryRepository.getAll();
    },
    getCategoryById(id: number) {
      return categoryRepository.getById(id);
    },
    createCategory(input: CreateCategoryInput) {
      return categoryRepository.add(input);
    },
  };
}
