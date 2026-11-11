import type { RegisterUserInput, User, UserCredentials } from './entity.js';

export interface Repository {
  getById(id: number): Promise<User | undefined>;
  getByEmail(email: string): Promise<UserCredentials | undefined>;
  add(input: RegisterUserInput): Promise<User>;
}
