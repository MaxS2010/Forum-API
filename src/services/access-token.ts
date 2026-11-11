import 'dotenv/config';
import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env['AUTH_JWT_SECRET'];
if (!jwtSecret || Buffer.byteLength(jwtSecret) < 32) {
  throw new Error('AUTH_JWT_SECRET must be configured with at least 32 bytes');
}

const signingKey = new TextEncoder().encode(jwtSecret);
const ACCESS_TOKEN_TTL = '15m';

export interface AccessTokenPayload {
  userId: number;
  email: string;
}

export async function createAccessToken(user: AccessTokenPayload): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.userId))
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(signingKey);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | undefined> {
  try {
    const { payload } = await jwtVerify(token, signingKey, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1 || typeof payload.email !== 'string') return undefined;
    return { userId, email: payload.email };
  } catch {
    return undefined;
  }
}
