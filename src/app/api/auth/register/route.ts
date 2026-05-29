import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { createAuthCookie, hashPassword, sanitizeUser, signAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return apiError("An account with this email already exists", 409);
    }

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: "USER",
        status: "PENDING",
      },
    });

    const safeUser = sanitizeUser(user);
    const token = signAuthToken({
      userId: user.id,
      role: user.role,
    });

    const response = apiSuccess(
      {
        user: safeUser,
        token,
      },
      { status: 201 },
    );
    response.cookies.set(createAuthCookie(token));

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
