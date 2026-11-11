import type { RequestHandler } from 'express';
import type { Post } from '../../domain/post/entity.js';
import type { PostService } from '../../services/post.types.js';
import type { UserService } from '../../services/user.types.js';
import { ApiError } from '../../shared/errors.js';
import type { ErrorResponse } from '../dto/user/errors.js';
import type { UserCredentialsRequest } from '../dto/user/requests.js';
import type { AuthResponse, User } from '../dto/user/responses.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;

export interface UserHandlers {
  register: RequestHandler<Record<string, never>, User | ErrorResponse, UserCredentialsRequest>;
  login: RequestHandler<Record<string, never>, AuthResponse | ErrorResponse, UserCredentialsRequest>;
  logout: RequestHandler<Record<string, never>, { message: string }>;
  me: RequestHandler<Record<string, never>, User | ErrorResponse>;
  getOwnPosts: RequestHandler<Record<string, never>, Post[] | ErrorResponse>;
}

export function createUserHandlers(userService: UserService, postService: PostService): UserHandlers {
  return {
    async register(req, res) {
      const credentials = parseCredentials(req.body);
      const user = await userService.register(credentials);
      return res.status(201).json(user);
    },

    async login(req, res) {
      const credentials = parseCredentials(req.body);
      const session = await userService.login(credentials);
      res.cookie('accessToken', session.accessToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      return res.json({ user: session.user });
    },

    logout(_req, res) {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return res.json({ message: 'Logged out' });
    },

    async me(req, res) {
      const userId = req.auth?.userId;
      if (userId === undefined) throw new ApiError(401, 'Authentication required');

      const user = await userService.getById(userId);
      if (!user) throw new ApiError(401, 'Authenticated user no longer exists');
      return res.json(user);
    },

    async getOwnPosts(req, res) {
      const userId = req.auth?.userId;
      if (userId === undefined) throw new ApiError(401, 'Authentication required');
      return res.json(await postService.getPosts({ authorId: userId }));
    },
  };
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
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254) {
    throw new ApiError(422, 'email must be a valid email address');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(422, 'password must contain between 8 and 128 characters');
  }

  return { email: email.trim(), password };
}
