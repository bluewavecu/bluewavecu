import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { supportTicketSchema } from "@/lib/validators";
import type { PageSupportTicket } from "@/types/banking";

export const runtime = "nodejs";

function serializeTicket(ticket: {
  id: string;
  subject: string;
  message: string;
  status: PageSupportTicket["status"];
  priority: PageSupportTicket["priority"];
  createdAt: Date;
  updatedAt: Date;
}): PageSupportTicket {
  return {
    id: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const tickets = await getPrisma().supportTicket.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      tickets: tickets.map(serializeTicket),
    });
  } catch (error) {
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

    const rateLimit = enforceRateLimit(request, "support-create", rateLimitPresets.support);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
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

    return apiSuccess({ ticket: serializeTicket(ticket) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
