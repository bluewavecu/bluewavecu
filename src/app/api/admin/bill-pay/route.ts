import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import {
  approveBillPaymentReview,
  failBillPaymentReview,
  LedgerError,
  serializeBillPayment,
} from "@/lib/billPay";
import { getPrisma } from "@/lib/prisma";
import { adminBillPaymentReviewSchema } from "@/lib/validators";
import type { AdminBillPaymentRecord, AdminBillPaymentsData, BillPaymentStatus } from "@/types/banking";

export const runtime = "nodejs";

function serializeAdminBillPayment(record: {
  id: string;
  fromAccountId: string;
  payeeId: string;
  amount: { toNumber: () => number };
  memo: string | null;
  dueDate: Date | null;
  scheduledFor: Date | null;
  status: BillPaymentStatus;
  transactionId: string | null;
  riskScore: number | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  fromAccount: { accountNumber: string };
  payee: { id: string; name: string; nickname: string | null; category: string | null };
  user: { id: string; fullName: string; email: string };
}): AdminBillPaymentRecord {
  return {
    ...serializeBillPayment(record),
    user: record.user,
  };
}

function handleBillPayError(error: LedgerError) {
  if (error.code === "NOT_FOUND") {
    return apiError(error.message, 404);
  }

  return apiError(error.message, 400);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const riskLevel = searchParams.get("riskLevel");

    const where: {
      status?: BillPaymentStatus;
      OR?: Array<{ memo?: { contains: string; mode: "insensitive" }; payee?: { name: { contains: string; mode: "insensitive" } } }>;
      riskScore?: { gte?: number };
    } = {};

    if (status && status !== "ALL") {
      where.status = status as BillPaymentStatus;
    }

    if (search) {
      where.OR = [
        { memo: { contains: search, mode: "insensitive" } },
        { payee: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (riskLevel === "HIGH") {
      where.riskScore = { gte: 70 };
    } else if (riskLevel === "MEDIUM") {
      where.riskScore = { gte: 40 };
    }

    const prisma = getPrisma();

    const [billPayments, pendingReview, total] = await Promise.all([
      prisma.billPayment.findMany({
        where,
        include: {
          fromAccount: { select: { accountNumber: true } },
          payee: { select: { id: true, name: true, nickname: true, category: true } },
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.billPayment.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.billPayment.count(),
    ]);

    const data: AdminBillPaymentsData = {
      billPayments: billPayments.map(serializeAdminBillPayment),
      summary: { pendingReview, total },
    };

    return apiSuccess(data);
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

    const input = adminBillPaymentReviewSchema.parse(await request.json());

    if (input.action === "APPROVE") {
      const result = await approveBillPaymentReview({
        billPaymentId: input.billPaymentId,
        adminId: auth.admin.id,
        reviewNote: input.reviewNote,
      });

      await logAdminAction({
        adminId: auth.admin.id,
        action: "APPROVE_BILL_PAYMENT",
        entityType: "BillPayment",
        entityId: input.billPaymentId,
        details: {
          reference: result.transaction.reference,
          reviewNote: input.reviewNote ?? null,
        },
      });

      return apiSuccess({ billPayment: result.billPayment });
    }

    const billPayment = await failBillPaymentReview({
      billPaymentId: input.billPaymentId,
      adminId: auth.admin.id,
      action: input.action === "CANCEL" ? "CANCELLED" : "FAILED",
      reviewNote: input.reviewNote,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: input.action === "CANCEL" ? "CANCEL_BILL_PAYMENT" : "FAIL_BILL_PAYMENT",
      entityType: "BillPayment",
      entityId: input.billPaymentId,
      details: {
        reviewNote: input.reviewNote ?? null,
      },
    });

    return apiSuccess({ billPayment });
  } catch (error) {
    if (error instanceof LedgerError) {
      return handleBillPayError(error);
    }

    return handleApiError(error);
  }
}
