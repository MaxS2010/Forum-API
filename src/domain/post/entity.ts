import type { Category } from '../category/entity.js';
import type { User } from '../user/entity.js';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  category: Category;
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: number;
  categoryId: number;
}
