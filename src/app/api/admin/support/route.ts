import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sendSupportTicketUpdatedEmail } from "@/lib/email";
import { createSupportNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { adminUpdateSupportTicketStatusSchema } from "@/lib/validators";
import type {
  AdminSupportTicketRecord,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/banking";

export const runtime = "nodejs";

function serializeTicket(ticket: {
  id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; fullName: string; email: string };
}): AdminSupportTicketRecord {
  return {
    id: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: ticket.user,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as SupportTicketStatus | null;
    const priority = searchParams.get("priority") as SupportTicketPriority | null;

    const tickets = await getPrisma().supportTicket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      tickets: tickets.map(serializeTicket),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminUpdateSupportTicketStatusSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing) {
      return apiError("Support ticket not found", 404);
    }

    const updated = await prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: { status: input.status },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_SUPPORT_TICKET_STATUS",
      entityType: "SupportTicket",
      entityId: updated.id,
      details: {
        previousStatus: existing.status,
        nextStatus: updated.status,
        subject: updated.subject,
        userEmail: updated.user.email,
      },
    });

    void sendSupportTicketUpdatedEmail({
      email: updated.user.email,
      fullName: updated.user.fullName,
      ticketId: updated.id,
      subject: updated.subject,
      status: updated.status,
    });
    void createSupportNotification({
      userId: updated.user.id,
      event: "updated",
      ticketId: updated.id,
      subject: updated.subject,
      status: updated.status,
    });

    return apiSuccess({ ticket: serializeTicket(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
