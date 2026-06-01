import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAccountDisplayName, maskAccountNumber } from "@/lib/bankingSerialize";
import {
  issueMemberCard,
  serializeCardApplication,
  serializePageCard,
} from "@/lib/cardApplications";
import { getPrisma } from "@/lib/prisma";
import { sortMemberDisplayAccounts } from "@/lib/sortMemberDisplayAccounts";
import { adminIssueMemberCardSchema } from "@/lib/validators";
import type { AdminMemberCardsData, LinkedAccountSummary } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        transactionsUnrestricted: true,
        billPayPaused: true,
        transactionPinHash: true,
        statusNote: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.deletedAt || user.role !== "USER") {
      return apiError("Member not found", 404);
    }

    const [cards, applications, accounts] = await Promise.all([
      prisma.card.findMany({
        where: { userId: id },
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
        where: { userId: id },
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
        where: { userId: id, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const serializedAccounts: LinkedAccountSummary[] = sortMemberDisplayAccounts(accounts).map(
      (account) => {
        const masked = maskAccountNumber(account.accountNumber);

        return {
          id: account.id,
          accountType: account.accountType,
          displayName: getAccountDisplayName(account.accountType),
          maskedAccountNumber: masked.masked,
        };
      },
    );

    const data: AdminMemberCardsData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        transactionsUnrestricted: user.transactionsUnrestricted,
        billPayPaused: user.billPayPaused,
        hasTransactionPin: Boolean(user.transactionPinHash),
        statusNote: user.statusNote,
        deletedAt: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accounts: serializedAccounts,
      cards: cards.map(serializePageCard),
      applications: applications.map(serializeCardApplication),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;
    const input = adminIssueMemberCardSchema.parse(await request.json());
    const card = await issueMemberCard({
      userId: id,
      adminId: auth.admin.id,
      accountId: input.accountId,
      cardType: input.cardType,
      spendingLimit: input.spendingLimit,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "ISSUE_MEMBER_CARD",
      entityType: "Card",
      entityId: card.id,
      details: {
        userId: id,
        accountId: input.accountId,
        cardType: input.cardType,
        last4: card.last4,
      },
    });

    return apiSuccess(
      {
        card,
        message: `${input.cardType} Mastercard ending ${card.last4} issued successfully.`,
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
