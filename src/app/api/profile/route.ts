import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  getOrCreateCustomerProfile,
  serializeCustomerProfile,
  submitCustomerKyc,
  updateCustomerProfile,
} from "@/lib/customerProfile";
import { profileSubmitSchema, profileUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const profile = await getOrCreateCustomerProfile(payload.userId);

    return apiSuccess({ profile: serializeCustomerProfile(profile) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const input = profileUpdateSchema.parse(await request.json());
    const profile = await updateCustomerProfile({
      userId: payload.userId,
      ...input,
    });

    return apiSuccess({ profile: serializeCustomerProfile(profile) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Complete your profile")) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    profileSubmitSchema.parse(await request.json());
    const profile = await submitCustomerKyc(payload.userId);

    return apiSuccess({ profile: serializeCustomerProfile(profile) });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("Complete your profile") ||
        error.message.includes("already") ||
        error.message.includes("under review"))
    ) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
