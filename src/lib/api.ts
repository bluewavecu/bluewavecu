import { NextResponse } from "next/server";
import { ZodError } from "zod";
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

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error,
    },
    { status },
  );
}

export function validationError(error: ZodError) {
  return apiError(error.issues[0]?.message ?? "Invalid request payload", 400);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  console.error(error);
  return apiError("Unexpected server error", 500);
}
