import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  sendAdminAlertEmail,
  sendSupportTicketCreatedEmail,
} from "@/lib/email";
import { writeEventLog } from "@/lib/eventLog";
import { createSupportNotification } from "@/lib/notifications";
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
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, fullName: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: payload.userId,
        subject: input.subject,
        message: input.message,
        priority: input.priority,
        status: "OPEN",
      },
    });

    void sendSupportTicketCreatedEmail({
      email: user.email,
      fullName: user.fullName,
      ticketId: ticket.id,
      subject: ticket.subject,
    });
    void sendAdminAlertEmail({
      subject: "New support ticket",
      message: `${user.fullName} opened ticket "${ticket.subject}".`,
      idempotencyKey: `admin-alert/support-created/${ticket.id}`,
    });
    void createSupportNotification({
      userId: payload.userId,
      event: "created",
      ticketId: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
    });

    void writeEventLog({
      eventType: "SUPPORT_TICKET_CREATED",
      actorId: payload.userId,
      entityType: "SupportTicket",
      entityId: ticket.id,
      message: `Support ticket created: ${ticket.subject}.`,
      metadata: { priority: ticket.priority },
    });

    return apiSuccess({ ticket: serializeTicket(ticket) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
