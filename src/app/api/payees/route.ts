import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { createPayee, serializePayee } from "@/lib/billPay";
import { getPrisma } from "@/lib/prisma";
import { payeeCreateSchema } from "@/lib/validators";
import type { PayeesData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

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

    const input = payeeCreateSchema.parse(await request.json());
    const payee = await createPayee(payload.userId, input);

    return apiSuccess({ payee }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
