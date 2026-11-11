import type { RegisterUserInput, User } from '../domain/user/entity.js';
import type { Repository } from '../domain/user/repository.js';
import { ApiError } from '../shared/errors.js';
import { createAccessToken } from './access-token.js';
import { hashPassword, verifyPassword } from './password.js';
import type { UserService } from './user.types.js';

const DUMMY_PASSWORD_HASH = await hashPassword('not-a-real-user-password');

export function createUserService(userRepository: Repository): UserService {
  return {
    async register(input: RegisterUserInput): Promise<User> {
      return userRepository.add({
        email: input.email.trim().toLowerCase(),
        password: await hashPassword(input.password),
      });
    },

    async login(input: RegisterUserInput): Promise<{ user: User; accessToken: string }> {
      const email = input.email.trim().toLowerCase();
      const user = await userRepository.getByEmail(email);
      const passwordMatches = await verifyPassword(input.password, user?.password ?? DUMMY_PASSWORD_HASH);
      if (!user || !passwordMatches) throw new ApiError(401, 'Invalid email or password');

      const { password: _password, ...publicUser } = user;
      return {
        user: publicUser,
        accessToken: await createAccessToken({ userId: user.id, email: user.email }),
      };
    },

    getById(id: number) {
      return userRepository.getById(id);
    },
  };
}
