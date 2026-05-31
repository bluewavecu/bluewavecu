import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { writeAdminEvent } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import {
  generateAccountTransactions,
  TransactionGeneratorError,
} from "@/lib/transactionGenerator";
import { adminGenerateTransactionsSchema } from "@/lib/validators";

export const runtime = "nodejs";

function handleGeneratorError(error: TransactionGeneratorError) {
  if (error.code === "NOT_FOUND") {
    return apiError(error.message, 404);
  }

  return apiError(error.message, 400);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminGenerateTransactionsSchema.parse(await request.json());

    const member = await getPrisma().user.findFirst({
      where: {
        id: input.userId,
        role: "USER",
        deletedAt: null,
      },
      select: { id: true, fullName: true },
    });

    if (!member) {
      return apiError("Member not found.", 404);
    }

    const fromDate = new Date(input.fromDate);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(input.toDate);
    toDate.setHours(23, 59, 59, 999);

    const result = await generateAccountTransactions({
      adminId: auth.admin.id,
      userId: input.userId,
      accountId: input.accountId,
      creditCount: input.creditCount,
      debitCount: input.debitCount,
      fromDate,
      toDate,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "GENERATE_TRANSACTIONS",
      entityType: "Account",
      entityId: input.accountId,
      details: {
        userId: input.userId,
        creditCount: input.creditCount,
        debitCount: input.debitCount,
        created: result.created,
        netAmount: result.netAmount,
        fromDate: result.fromDate,
        toDate: result.toDate,
      },
    });

    void writeAdminEvent({
      eventType: "TRANSACTIONS_GENERATED",
      actorId: auth.admin.id,
      entityId: input.accountId,
      message: `Generated ${result.created} transactions for ${member.fullName}.`,
      metadata: {
        created: result.created,
        netAmount: result.netAmount,
      },
    });

    return apiSuccess({ result }, { status: 201 });
  } catch (error) {
    if (error instanceof TransactionGeneratorError) {
      return handleGeneratorError(error);
    }

    return handleApiError(error);
  }
}
