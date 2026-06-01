import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth, resolveMemberWriteAuth } from "@/lib/requestAuth";

import { BillPayPausedError } from "@/lib/billPayAccess";
import { createPayee, serializePayee } from "@/lib/billPay";
import { getPrisma } from "@/lib/prisma";
import { payeeCreateSchema } from "@/lib/validators";
import type { PayeesData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const payees = await getPrisma().payee.findMany({
      where: {
        userId: payload.userId,
        status: { in: ["ACTIVE", "INACTIVE"] },
      },
      orderBy: { name: "asc" },
    });

    const data: PayeesData = {
      payees: payees.map(serializePayee),
    };

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof BillPayPausedError) {
      return apiError(error.message, 403);
    }

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

    const input = payeeCreateSchema.parse(await request.json());
    const payee = await createPayee(payload.userId, input);

    return apiSuccess({ payee }, { status: 201 });
  } catch (error) {
    if (error instanceof BillPayPausedError) {
      return apiError(error.message, 403);
    }

    return handleApiError(error);
  }
}
