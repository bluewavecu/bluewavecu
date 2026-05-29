import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import type { AuthTokenPayload, SafeUser } from "@/types/banking";

const AUTH_COOKIE_NAME = "bluewave_auth";

type UserWithPassword = SafeUser & {
  passwordHash: string;
};

function getJwtSecret() {
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
    expiresIn: "7d",
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
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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
