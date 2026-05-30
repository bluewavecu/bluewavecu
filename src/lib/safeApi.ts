import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { apiError, validationError } from "@/lib/api";

export function safeHandleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  console.error("[api]", error);

  if (process.env.NODE_ENV === "production") {
    return apiError("Unexpected server error", 500);
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return apiError(message, 500);
}

type RouteHandler = (request: NextRequest, context?: unknown) => Promise<Response>;

export function withSafeApi(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return safeHandleApiError(error);
    }
  };
}
