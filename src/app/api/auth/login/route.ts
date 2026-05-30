import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { createAuthCookie, sanitizeUser, signAuthToken, verifyPassword } from "@/lib/auth";
import { sendLoginAlertEmail } from "@/lib/email";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-login", rateLimitPresets.login);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = loginSchema.parse(await request.json());
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);

    if (!passwordMatches) {
      return apiError("Invalid email or password", 401);
    }

    if (user.status === "SUSPENDED") {
      return apiError("This account is suspended", 403);
    }

    const token = signAuthToken({
      userId: user.id,
      role: user.role,
    });

    const response = apiSuccess({
      user: sanitizeUser(user),
      token,
    });
    response.cookies.set(createAuthCookie(token));

    void sendLoginAlertEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    });
    void createSecurityNotification({
      userId: user.id,
      metadata: { href: "/dashboard" },
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
