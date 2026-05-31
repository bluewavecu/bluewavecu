import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  createBillPayment,
  serializeBillPayment,
  submitBillPaymentForReview,
} from "@/lib/billPay";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { billPaymentCreateSchema } from "@/lib/validators";
import type { BillPaymentsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const billPayments = await getPrisma().billPayment.findMany({
      where: { userId: payload.userId },
      include: {
        fromAccount: { select: { accountNumber: true } },
        payee: { select: { id: true, name: true, nickname: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: BillPaymentsData = {
      billPayments: billPayments.map(serializeBillPayment),
    };

    return apiSuccess(data);
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

    const rateLimit = enforceRateLimit(request, "bill-pay", rateLimitPresets.transfer);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = billPaymentCreateSchema.parse(await request.json());
    const billPayment = await createBillPayment(payload.userId, input);

    if (input.submitForReview) {
      const submitted = await submitBillPaymentForReview(payload.userId, billPayment.id);
      return apiSuccess(
        {
          billPayment: submitted,
          message: "Bill payment submitted for operations review. Balances update after approval and posting.",
        },
        { status: 201 },
      );
    }

    return apiSuccess(
      {
        billPayment,
        message: "Bill payment saved. Submit for review before posting.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("blocked due to critical risk")) {
      return apiError(error.message, 403);
    }

    return handleApiError(error);
  }
}
