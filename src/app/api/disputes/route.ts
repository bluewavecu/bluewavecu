import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth, resolveMemberWriteAuth } from "@/lib/requestAuth";

import { createDispute, serializeDispute } from "@/lib/disputes";
import { getPrisma } from "@/lib/prisma";
import { disputeCreateSchema } from "@/lib/validators";
import type { DisputesData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const disputes = await getPrisma().dispute.findMany({
      where: { userId: payload.userId },
      include: {
        transaction: {
          select: {
            reference: true,
            amount: true,
            description: true,
            merchant: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: DisputesData = {
      disputes: disputes.map(serializeDispute),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveMemberWriteAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = disputeCreateSchema.parse(await request.json());
    const dispute = await createDispute({
      userId: payload.userId,
      transactionId: input.transactionId,
      reason: input.reason,
      description: input.description,
    });

    return apiSuccess({ dispute }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Transaction not found") {
        return apiError(error.message, 404);
      }

      if (error.message.includes("open dispute")) {
        return apiError(error.message, 409);
      }
    }

    return handleApiError(error);
  }
}
