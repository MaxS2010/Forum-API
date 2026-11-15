import type { User } from '../../domain/user/entity.js';

export interface AuthInput {
  email: string;
  password: string;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, encodedHash: string): Promise<boolean>;
}

export interface TokenService {
  signAccessToken(user: { userId: number; email: string }): Promise<string>;
  signRefreshToken(userId: number): Promise<string>;
  verifyRefreshToken(token: string): Promise<number | undefined>;
}

export interface AuthService {
  register(input: AuthInput): Promise<User>;
  login(input: AuthInput): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;
  refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  me(userId: number): Promise<User>;
}
