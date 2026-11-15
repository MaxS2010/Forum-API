import type { RequestHandler, Response } from 'express';
import type { Post } from '../../domain/post/entity.js';
import type { User } from '../../domain/user/entity.js';
import type { PostService } from '../../services/post.types.js';
import type { AuthService } from '../../services/auth/auth.types.js';
import { ApiError } from '../../shared/errors.js';
import type { ErrorResponse } from '../dto/user/errors.js';
import type { UserCredentialsRequest } from '../dto/user/requests.js';
import type { AuthResponse } from '../dto/user/responses.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export interface AuthHandlers {
  register: RequestHandler<Record<string, never>, User | ErrorResponse, UserCredentialsRequest>;
  login: RequestHandler<Record<string, never>, AuthResponse | ErrorResponse, UserCredentialsRequest>;
  refresh: RequestHandler<Record<string, never>, { message: string } | ErrorResponse>;
  logout: RequestHandler<Record<string, never>, { message: string }>;
  me: RequestHandler<Record<string, never>, User | ErrorResponse>;
  getOwnPosts: RequestHandler<Record<string, never>, Post[] | ErrorResponse>;
}

export function createAuthHandlers(authService: AuthService, postService: PostService): AuthHandlers {
  return {
    async register(req, res) {
      const credentials = parseCredentials(req.body);
      const user = await authService.register(credentials);
      return res.status(201).json(user);
    },

    async login(req, res) {
      const credentials = parseCredentials(req.body);
      const session = await authService.login(credentials);
      setAuthCookies(res, session.accessToken, session.refreshToken);
      return res.json({ user: session.user });
    },

    async refresh(req, res) {
      const refreshToken: unknown = req.cookies?.refreshToken;
      if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new ApiError(401, 'Refresh token is required');
      }

      const session = await authService.refresh(refreshToken);
      setAuthCookies(res, session.accessToken, session.refreshToken);
      return res.json({ message: 'Tokens refreshed' });
    },

    logout(_req, res) {
      clearAuthCookies(res);
      return res.json({ message: 'Logged out' });
    },

    async me(req, res) {
      const userId = req.auth?.userId;
      if (userId === undefined) throw new ApiError(401, 'Authentication required');
      return res.json(await authService.me(userId));
    },

    async getOwnPosts(req, res) {
      const userId = req.auth?.userId;
      if (userId === undefined) throw new ApiError(401, 'Authentication required');
      return res.json(await postService.getPosts({ authorId: userId }));
    },
  };
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const secure = process.env['NODE_ENV'] === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

function clearAuthCookies(res: Response): void {
  const options = {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax' as const,
  };
  res.clearCookie('accessToken', { ...options, path: '/' });
  res.clearCookie('refreshToken', { ...options, path: '/auth' });
}

function parseCredentials(body: unknown): UserCredentialsRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(422, 'Request body must be an object');
  }

  const credentials = body as Record<string, unknown>;
  if (Object.keys(credentials).some((field) => field !== 'email' && field !== 'password')) {
    throw new ApiError(422, 'Request contains invalid fields');
  }

  const { email, password } = credentials;
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.length > 254
  ) {
    throw new ApiError(422, 'email must be a valid email address');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(422, 'password must contain between 8 and 128 characters');
  }

  return { email: email.trim(), password };
}
