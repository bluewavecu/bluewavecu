import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { writeEventLog } from "@/lib/eventLog";
import { createSupportNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { cardActionSchema } from "@/lib/validators";
import type { CardActionResult } from "@/types/banking";

export const runtime = "nodejs";

const actionLabels: Record<string, string> = {
  LOCK: "Lock card",
  UNLOCK: "Unlock card",
  REPORT_LOST: "Report lost/stolen card",
  REQUEST_REPLACEMENT: "Request card replacement",
  TRAVEL_NOTICE: "Travel notice",
  UPDATE_SPENDING_LIMIT: "Update spending limit",
};

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = cardActionSchema.parse(await request.json());
    const prisma = getPrisma();

    const card = await prisma.card.findFirst({
      where: { id: input.cardId, userId: payload.userId },
      select: { id: true, last4: true, cardType: true },
    });

    if (!card) {
      return apiError("Card not found", 404);
    }

    const actionLabel = actionLabels[input.action] ?? input.action;
    const subject = `[Card] ${actionLabel} — **** ${card.last4}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: payload.userId,
        subject,
        message:
          input.note?.trim() ||
          `Member requested ${actionLabel.toLowerCase()} for card ending ${card.last4}. A member services specialist will complete this request and confirm when the change is processed.`,
        priority: input.action === "REPORT_LOST" ? "URGENT" : "NORMAL",
        status: "OPEN",
      },
    });

    void createSupportNotification({
      userId: payload.userId,
      event: "created",
      ticketId: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
    });

    void writeEventLog({
      eventType: "CARD_ACTION_REQUESTED",
      actorId: payload.userId,
      entityType: "Card",
      entityId: card.id,
      message: `${actionLabel} request submitted for card **** ${card.last4}.`,
      metadata: { action: input.action, ticketId: ticket.id },
    });

    const result: CardActionResult = {
      cardId: card.id,
      action: input.action,
      status: "REQUEST_SUBMITTED",
      ticketId: ticket.id,
      message: `${actionLabel} request submitted. A support specialist will follow up.`,
    };

    return apiSuccess(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
