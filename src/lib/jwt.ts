import 'dotenv/config';
import { SignJWT, jwtVerify } from 'jose';

const accessSecret = process.env['AUTH_JWT_SECRET'];
const refreshSecret = process.env['AUTH_REFRESH_JWT_SECRET'];

if (!accessSecret || Buffer.byteLength(accessSecret) < 32) {
  throw new Error('AUTH_JWT_SECRET must be configured with at least 32 bytes');
}
if (!refreshSecret || Buffer.byteLength(refreshSecret) < 32) {
  throw new Error('AUTH_REFRESH_JWT_SECRET must be configured with at least 32 bytes');
}

const accessSigningKey = new TextEncoder().encode(accessSecret);
const refreshSigningKey = new TextEncoder().encode(refreshSecret);

export interface AccessTokenPayload {
  userId: number;
  email: string;
}

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function signAccessToken(user: AccessTokenPayload): Promise<string> {
  return new SignJWT({ email: user.email, tokenUse: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.userId))
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessSigningKey);
}

export async function signRefreshToken(userId: number): Promise<string> {
  return new SignJWT({ tokenUse: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SECONDS}s`)
    .sign(refreshSigningKey);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | undefined> {
  try {
    const { payload } = await jwtVerify(token, accessSigningKey, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    if (
      !Number.isSafeInteger(userId) ||
      userId < 1 ||
      typeof payload.email !== 'string' ||
      payload.tokenUse !== 'access'
    ) {
      return undefined;
    }

    return { userId, email: payload.email };
  } catch {
    return undefined;
  }
}

export async function verifyRefreshToken(token: string): Promise<number | undefined> {
  try {
    const { payload } = await jwtVerify(token, refreshSigningKey, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1 || payload.tokenUse !== 'refresh') {
      return undefined;
    }

    return userId;
  } catch {
    return undefined;
  }
}
