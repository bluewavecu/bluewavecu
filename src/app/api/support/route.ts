import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { supportTicketSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    const tickets = await getPrisma().supportTicket.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    const input = supportTicketSchema.parse(await request.json());

    const ticket = await getPrisma().supportTicket.create({
      data: {
        userId: payload.userId,
        subject: input.subject,
        message: input.message,
        priority: input.priority,
        status: "OPEN",
      },
    });

    return apiSuccess({ ticket }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
