import type { User } from '../../../domain/user/entity.js';

export type { User };

export interface AuthResponse {
  user: User;
}
