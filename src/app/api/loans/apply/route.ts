import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveMemberWriteAuth } from "@/lib/requestAuth";

import { sendAdminAlertEmail } from "@/lib/email";
import { writeEventLog } from "@/lib/eventLog";
import { createSupportNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { loanApplySchema } from "@/lib/validators";
import type { LoanApplyResult } from "@/types/banking";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveMemberWriteAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = loanApplySchema.parse(await request.json());
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { fullName: true, email: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const subject = `[Loan] ${input.loanType} application request`;
    const message = [
      `Loan type: ${input.loanType}`,
      `Requested amount: $${input.requestedAmount.toLocaleString()}`,
      `Term: ${input.termMonths} months`,
      "",
      "Purpose:",
      input.purpose,
      "",
      "This application is under review. No credit decision or approval has been made yet.",
    ].join("\n");

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: payload.userId,
        subject,
        message,
        priority: "NORMAL",
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

    void sendAdminAlertEmail({
      subject: "Loan application request",
      message: `${user.fullName} submitted a loan application for ${input.loanType}.`,
      idempotencyKey: `admin-alert/loan-apply/${ticket.id}`,
    });

    void writeEventLog({
      eventType: "LOAN_APPLICATION_REQUESTED",
      actorId: payload.userId,
      entityType: "SupportTicket",
      entityId: ticket.id,
      message: `Loan application request submitted for ${input.loanType}.`,
      metadata: {
        loanType: input.loanType,
        requestedAmount: input.requestedAmount,
        termMonths: input.termMonths,
      },
    });

    const result: LoanApplyResult = {
      ticketId: ticket.id,
      message:
        "Your loan application request was received. This is not an approval — a specialist will review your request.",
    };

    return apiSuccess(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
