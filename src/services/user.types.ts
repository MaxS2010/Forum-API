import type { RegisterUserInput, User } from '../domain/user/entity.js';

export interface UserService {
  register(input: RegisterUserInput): Promise<User>;
  login(input: RegisterUserInput): Promise<{ user: User; accessToken: string }>;
  getById(id: number): Promise<User | undefined>;
}
