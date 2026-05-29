import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    const loans = await getPrisma().loan.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      loans: loans.map((loan) => ({
        id: loan.id,
        userId: loan.userId,
        loanType: loan.loanType,
        principal: loan.principal.toNumber(),
        balance: loan.balance.toNumber(),
        interestRate: loan.interestRate.toNumber(),
        termMonths: loan.termMonths,
        monthlyPayment: loan.monthlyPayment.toNumber(),
        status: loan.status,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
