import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { createAuthCookie, hashPassword, sanitizeUser, signAuthToken } from "@/lib/auth";
import { sendAdminAlertEmail, sendWelcomeEmail } from "@/lib/email";
import { writeAdminEvent } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

function formatAddress(input: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  const lines = [
    input.addressLine1,
    input.addressLine2,
    `${input.city}, ${input.state} ${input.postalCode}`,
    input.country,
  ].filter(Boolean);

  return lines.join(", ");
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-register", rateLimitPresets.register);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = registerSchema.parse(await request.json());
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return apiError("An account with this email already exists", 409);
    }

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          passwordHash: await hashPassword(input.password),
          role: "USER",
          status: "PENDING",
        },
      });

      await tx.customerProfile.create({
        data: {
          userId: createdUser.id,
          dateOfBirth: input.dateOfBirth,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          employmentStatus: input.occupation,
        },
      });

      return createdUser;
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

    const formattedDob = input.dateOfBirth.toISOString().slice(0, 10);
    const formattedAddress = formatAddress(input);

    void sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    });

    void writeAdminEvent({
      eventType: "MEMBER_REGISTRATION",
      actorId: user.id,
      entityId: user.id,
      message: `${user.fullName} submitted a membership application.`,
      metadata: {
        email: user.email,
        phone: user.phone,
        dateOfBirth: formattedDob,
        occupation: input.occupation,
        address: formattedAddress,
        status: user.status,
      },
    });

    void sendAdminAlertEmail({
      subject: "New membership application",
      message: [
        `${user.fullName} submitted a membership application.`,
        `Email: ${user.email}`,
        `Phone: ${user.phone}`,
        `Date of birth: ${formattedDob}`,
        `Occupation: ${input.occupation}`,
        `Address: ${formattedAddress}`,
        "Status: Pending review",
      ].join("\n"),
      idempotencyKey: `admin-alert/register/${user.id}`,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
