import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { getAccountDisplayName, maskAccountNumber } from "@/lib/bankingSerialize";
import { serializeCardApplication, serializePageCard, submitCardApplication, syncStaleCardApplications } from "@/lib/cardApplications";
import { getPrisma } from "@/lib/prisma";
import { cardApplySchema } from "@/lib/validators";
import type { CardsData, LinkedAccountSummary } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const prisma = getPrisma();

    await syncStaleCardApplications(payload.userId);

    const [cards, applications, accounts] = await Promise.all([
      prisma.card.findMany({
        where: { userId: payload.userId },
        include: {
          account: {
            select: {
              id: true,
              accountType: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cardApplication.findMany({
        where: { userId: payload.userId },
        include: {
          account: {
            select: {
              accountType: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.account.findMany({
        where: { userId: payload.userId, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const serializedAccounts: LinkedAccountSummary[] = accounts.map((account) => {
      const masked = maskAccountNumber(account.accountNumber);

      return {
        id: account.id,
        accountType: account.accountType,
        displayName: getAccountDisplayName(account.accountType),
        maskedAccountNumber: masked.masked,
      };
    });

    const data: CardsData = {
      cards: cards.map(serializePageCard),
      applications: applications.map(serializeCardApplication),
      accounts: serializedAccounts,
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = cardApplySchema.parse(await request.json());
    const application = await submitCardApplication({
      userId: payload.userId,
      input,
    });

    return apiSuccess(
      {
        application,
        message:
          "Your Mastercard application was submitted. We will email you when it is approved or if we need more information.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
