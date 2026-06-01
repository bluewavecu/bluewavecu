import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { createMemberUser } from "@/lib/createMemberUser";
import { createEmailVerificationOtpChallenge } from "@/lib/emailVerificationOtp";
import {
  sendEmailVerificationOtpEmail,
  sendMembershipApplicationAdminEmail,
} from "@/lib/email";
import { emailWasDelivered } from "@/lib/emailDelivery";
import { INSTITUTION } from "@/lib/institution";
import { writeAdminEvent, writeSecurityEvent } from "@/lib/eventLog";
import { describeRequestedAccounts } from "@/lib/memberAccounts";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { setUserTransactionPin } from "@/lib/transactionOtp";
import { getSignupAnnualIncomeAmount } from "@/data/signupAnnualIncome";
import { findUserByUsername, maskEmailAddress } from "@/lib/username";
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
  return [
    input.addressLine1,
    input.addressLine2,
    `${input.city}, ${input.state} ${input.postalCode}`,
    input.country,
  ]
    .filter(Boolean)
    .join(", ");
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

    const existingUsername = await findUserByUsername(prisma, input.username);

    if (existingUsername) {
      return apiError("This username is already taken", 409);
    }

    const user = await createMemberUser({
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      status: "PENDING",
      emailVerifiedAt: null,
      dateOfBirth: input.dateOfBirth,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      occupation: input.occupation,
      annualIncome: getSignupAnnualIncomeAmount(input.annualIncomeRange) ?? undefined,
      accountTypes: input.accountTypes,
    });

    await setUserTransactionPin({
      userId: user.id,
      pin: input.transactionPin,
    });

    const challenge = await createEmailVerificationOtpChallenge(user.id);

    const verificationEmailResult = await sendEmailVerificationOtpEmail({
      email: user.email,
      fullName: user.fullName,
      code: challenge.code,
      challengeId: challenge.challengeId,
      expiresMinutes: challenge.expiresMinutes,
    });

    const emailSent = emailWasDelivered(verificationEmailResult);

    const formattedDob = input.dateOfBirth.toISOString().slice(0, 10);
    const formattedAddress = formatAddress(input);

    void writeAdminEvent({
      eventType: "MEMBER_REGISTRATION",
      actorId: user.id,
      entityId: user.id,
      message: `${user.fullName} submitted a membership application.`,
      metadata: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: formattedDob,
        occupation: input.occupation,
        address: formattedAddress,
        accountTypes: describeRequestedAccounts(input.accountTypes),
        status: user.status,
      },
    });

    void sendMembershipApplicationAdminEmail({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: formattedDob,
      occupation: input.occupation,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      requestedAccountTypes: describeRequestedAccounts(input.accountTypes),
    });

    void writeSecurityEvent({
      eventType: emailSent ? "EMAIL_VERIFICATION_SENT" : "EMAIL_VERIFICATION_FAILED",
      actorId: user.id,
      entityId: challenge.challengeId,
      message: emailSent
        ? `Email verification code sent to ${maskEmailAddress(user.email)}.`
        : `Failed to send email verification code to ${maskEmailAddress(user.email)}.`,
      severity: emailSent ? "INFO" : "ERROR",
      metadata: emailSent
        ? undefined
        : {
            error:
              verificationEmailResult.ok === false
                ? verificationEmailResult.error
                : "Email not delivered",
          },
    });

    return apiSuccess(
      {
        requiresEmailVerification: true as const,
        verificationChallengeId: challenge.challengeId,
        username: user.username,
        maskedEmail: maskEmailAddress(user.email),
        emailSent,
        message: emailSent
          ? `Enter the 6-digit code sent to ${maskEmailAddress(user.email)}.`
          : `Your application was received, but we could not email a verification code. Use Resend code below or contact ${INSTITUTION.email}.`,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
