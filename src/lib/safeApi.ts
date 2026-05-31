import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { apiError, validationError } from "@/lib/api";

function getPublicErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return null;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database connection is unavailable. Please try again shortly.";
  }

  if (error instanceof Error && error.message.toLowerCase().includes("tls")) {
    return "Database connection is unavailable. Please try again shortly.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return "Database schema is out of date. Contact support if this continues.";
    }
  }

  return "Unexpected server error";
}

export function safeHandleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[api] prisma", error.code, error.message);
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[api] prisma init", error.message);
  } else {
    console.error("[api]", error);
  }

  const publicMessage = getPublicErrorMessage(error);

  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return apiError(error.message, 500);
  }

  return apiError(publicMessage ?? "Unexpected server error", 500);
}

type RouteHandler = (request: Request, context?: unknown) => Promise<Response>;

export function withSafeApi(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return safeHandleApiError(error);
    }
  };
}
