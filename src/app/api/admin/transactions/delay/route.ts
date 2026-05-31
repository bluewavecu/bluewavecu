import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sendTransactionDelayedEmail } from "@/lib/email";
import { writeLedgerEvent } from "@/lib/eventLog";
import { createTransferNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { adminMarkTransactionDelayedSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminMarkTransactionDelayedSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing) {
      return apiError("Transaction not found", 404);
    }

    if (existing.type !== "TRANSFER" || existing.status !== "PENDING") {
      return apiError("Only pending transfer transactions can be marked delayed", 400);
    }

    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        delayedAt: new Date(),
        reviewNote: input.reviewNote ?? existing.reviewNote,
      },
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "MARK_TRANSFER_DELAYED",
      entityType: "Transaction",
      entityId: updated.id,
      details: {
        reference: updated.reference,
        reviewNote: input.reviewNote ?? null,
      },
    });

    void sendTransactionDelayedEmail({
      email: existing.user.email,
      fullName: existing.user.fullName,
      amount: existing.amount.toNumber(),
      reference: existing.reference,
      description: existing.description,
      reviewNote: input.reviewNote ?? null,
    });

    void createTransferNotification({
      userId: existing.user.id,
      event: "created",
      reference: existing.reference,
      amount: existing.amount.toNumber(),
      metadata: { href: "/auth/transfers", delayed: true },
    });

    void writeLedgerEvent({
      eventType: "TRANSFER_DELAYED",
      actorId: auth.admin.id,
      entityId: updated.id,
      message: `Transfer ${updated.reference} marked for extended review.`,
      severity: "WARNING",
      metadata: { reference: updated.reference },
    });

    return apiSuccess({
      transactionId: updated.id,
      delayedAt: updated.delayedAt?.toISOString() ?? null,
      message: "Transfer marked as delayed and member notified.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
