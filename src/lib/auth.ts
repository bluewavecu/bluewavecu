import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { getServerEnv, tryGetServerEnv } from "@/lib/env";
import type { AuthTokenPayload, SafeUser } from "@/types/banking";

export const AUTH_COOKIE_NAME = "bluewave_auth";
export const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type UserWithPassword = SafeUser & {
  passwordHash: string;
};

function getJwtSecret() {
  const env = tryGetServerEnv();

  if (env?.JWT_SECRET) {
    return env.JWT_SECRET;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: `${AUTH_TOKEN_MAX_AGE_SECONDS}s`,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & AuthTokenPayload;

    if (!decoded.userId || !decoded.role) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };
  } catch {
    return null;
  }
}

export function decodeAuthTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payloadSegment = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadSegment.padEnd(payloadSegment.length + ((4 - (payloadSegment.length % 4)) % 4), "=");
    const decoded = JSON.parse(atob(padded)) as JwtPayload & AuthTokenPayload;

    if (!decoded.userId || !decoded.role) {
      return null;
    }

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: NextRequest) {
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearerToken || request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

export function createAuthCookie(token: string) {
  const env = tryGetServerEnv();
  const isProduction = env?.NODE_ENV === "production" || process.env.NODE_ENV === "production";

  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: AUTH_TOKEN_MAX_AGE_SECONDS,
  };
}

export function clearAuthCookie() {
  const env = tryGetServerEnv();
  const isProduction = env?.NODE_ENV === "production" || process.env.NODE_ENV === "production";

  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: 0,
  };
}

export function sanitizeUser(user: UserWithPassword): SafeUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function assertAuthEnvironment() {
  getServerEnv();
}
