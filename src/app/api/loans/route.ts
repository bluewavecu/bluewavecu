import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { LoanOffer, PageLoan } from "@/types/banking";

export const runtime = "nodejs";

const demoLoanOffers: LoanOffer[] = [
  {
    id: "offer-personal",
    title: "Personal Loan Pre-Qualification",
    description:
      "Review a sample pre-qualification range based on your membership profile and account history.",
    preApprovedAmount: 25000,
    rateRange: "7.49% - 12.99% APR",
    termMonths: 48,
    disclaimer:
      "This is a demo estimate only. Pre-qualification is not approval or a commitment to lend.",
  },
  {
    id: "offer-auto",
    title: "Auto Loan Preview",
    description:
      "Explore a sample vehicle financing estimate for qualified Bluewave members.",
    preApprovedAmount: 35000,
    rateRange: "5.99% - 9.49% APR",
    termMonths: 60,
    disclaimer:
      "Rates shown are illustrative demo values. Final terms require application review.",
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const loans = await getPrisma().loan.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    const serializedLoans: PageLoan[] = loans.map((loan) => ({
      id: loan.id,
      loanType: loan.loanType,
      principal: loan.principal.toNumber(),
      balance: loan.balance.toNumber(),
      interestRate: loan.interestRate.toNumber(),
      termMonths: loan.termMonths,
      monthlyPayment: loan.monthlyPayment.toNumber(),
      status: loan.status,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    }));

    return apiSuccess({
      loans: serializedLoans,
      offers: demoLoanOffers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
