import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { safeHandleApiError } from "@/lib/safeApi";
import type { ApiResponse } from "@/types/banking";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    init,
  );
}

export function apiError(error: string, status = 400, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

export function validationError(error: ZodError) {
  return apiError(error.issues[0]?.message ?? "Invalid request payload", 400);
}

export function handleApiError(error: unknown) {
  return safeHandleApiError(error);
}
