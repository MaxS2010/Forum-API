import type { Repository } from '../../domain/user/repository.js';
import { hashPassword } from '../../lib/password.js';
import { ApiError } from '../../shared/errors.js';
import type { AuthService, PasswordHasher, TokenService } from './auth.types.js';

const DUMMY_PASSWORD_HASH = await hashPassword('not-a-real-user-password');

export function createAuthService(
  repository: Repository,
  passwordHasher: PasswordHasher,
  tokenService: TokenService,
): AuthService {
  return {
    async register(input) {
      const email = input.email.trim().toLowerCase();
      const password = await passwordHasher.hash(input.password);
      return repository.add({ email, password });
    },

    async login(input) {
      const email = input.email.trim().toLowerCase();
      const user = await repository.getByEmail(email);
      const passwordMatches = await passwordHasher.verify(
        input.password,
        user?.password ?? DUMMY_PASSWORD_HASH,
      );
      if (!user || !passwordMatches) throw new ApiError(401, 'Invalid email or password');

      const publicUser = { id: user.id, email: user.email, name: user.name };
      const [accessToken, refreshToken] = await Promise.all([
        tokenService.signAccessToken({ userId: user.id, email: user.email }),
        tokenService.signRefreshToken(user.id),
      ]);

      return { user: publicUser, accessToken, refreshToken };
    },

    async refresh(refreshToken) {
      const userId = await tokenService.verifyRefreshToken(refreshToken);
      if (userId === undefined) throw new ApiError(401, 'Invalid or expired refresh token');

      const user = await repository.getById(userId);
      if (!user) throw new ApiError(401, 'Authenticated user no longer exists');

      const [accessToken, nextRefreshToken] = await Promise.all([
        tokenService.signAccessToken({ userId: user.id, email: user.email }),
        tokenService.signRefreshToken(user.id),
      ]);
      return { accessToken, refreshToken: nextRefreshToken };
    },

    async me(userId) {
      const user = await repository.getById(userId);
      if (!user) throw new ApiError(401, 'Authenticated user no longer exists');
      return user;
    },
  };
}
