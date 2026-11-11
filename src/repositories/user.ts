import type { RegisterUserInput, User, UserCredentials } from '../domain/user/entity.js';
import type { Repository } from '../domain/user/repository.js';
import type { db } from '../prisma/db.js';
import { getPostgresSqlState } from '../shared/database-errors.js';
import { ApiError } from '../shared/errors.js';

type PrismaDb = typeof db;

export function createUserRepository(database: PrismaDb): Repository {
  return {
    async getById(id: number): Promise<User | undefined> {
      return (await database.orm.public.User
        .select('id', 'email', 'name')
        .first({ id })) ?? undefined;
    },

    async getByEmail(email: string): Promise<UserCredentials | undefined> {
      return (await database.orm.public.User
        .select('id', 'email', 'name', 'password')
        .where({ email })
        .first()) ?? undefined;
    },

    async add(input: RegisterUserInput): Promise<User> {
      try {
        return await database.orm.public.User
          .select('id', 'email', 'name')
          .create({ email: input.email, password: input.password });
      } catch (error) {
        if (getPostgresSqlState(error) === '23505') {
          throw new ApiError(409, 'Email is already registered');
        }

        throw error;
      }
    },
  };
}
