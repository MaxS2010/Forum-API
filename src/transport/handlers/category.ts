import type { RequestHandler } from 'express';
import type { CategoryService } from '../../services/category.types.js';
import { ApiError } from '../../shared/errors.js';
import type { ErrorResponse } from '../dto/category/errors.js';
import type { CategoryParams, CreateCategoryRequest } from '../dto/category/requests.js';
import type { Category } from '../dto/category/responses.js';

export interface CategoryHandlers {
  getCategories: RequestHandler<Record<string, never>, Category[] | ErrorResponse>;
  getCategoryById: RequestHandler<CategoryParams, Category | ErrorResponse>;
  createCategory: RequestHandler<Record<string, never>, Category | ErrorResponse, CreateCategoryRequest>;
}

export function createCategoryHandlers(categoryService: CategoryService): CategoryHandlers {
  return {
    async getCategories(_req, res) {
      return res.json(await categoryService.getCategories());
    },

    async getCategoryById(req, res) {
      const id = parseId(req.params.id);
      if (id === null) throw new ApiError(400, 'id must be a positive integer');

      const category = await categoryService.getCategoryById(id);
      if (!category) throw new ApiError(404, 'Category not found');

      return res.json(category);
    },

    async createCategory(req, res) {
      const input = parseCreateCategory(req.body);
      return res.status(201).json(await categoryService.createCategory(input));
    },
  };
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseCreateCategory(body: unknown): CreateCategoryRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(422, 'Request body must be an object');
  }

  const category = body as Record<string, unknown>;
  if (Object.keys(category).some((field) => field !== 'name')) {
    throw new ApiError(422, 'Request contains invalid fields');
  }
  if (typeof category.name !== 'string' || !category.name.trim()) {
    throw new ApiError(422, 'name must be a non-empty string');
  }

  return { name: category.name.trim() };
}
