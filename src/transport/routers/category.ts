import { Router } from 'express';
import type { CategoryHandlers } from '../handlers/category.js';

export function createCategoryRouter(handlers: CategoryHandlers): Router {
  const categoryRouter = Router();
  categoryRouter.get('/categories', handlers.getCategories);
  categoryRouter.get('/categories/:id', handlers.getCategoryById);
  categoryRouter.post('/categories', handlers.createCategory);

  return categoryRouter;
}
