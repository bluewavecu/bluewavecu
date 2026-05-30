import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import {
  getAccountDisplayName,
  maskAccountNumber,
} from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { AdminAccountRecord } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const accounts = await getPrisma().account.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serializedAccounts: AdminAccountRecord[] = accounts.map((account) => {
      const masked = maskAccountNumber(account.accountNumber);

      return {
        id: account.id,
        accountType: account.accountType,
        displayName: getAccountDisplayName(account.accountType),
        maskedAccountNumber: masked.masked,
        balance: account.balance.toNumber(),
        availableBalance: account.availableBalance.toNumber(),
        currency: account.currency,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
        user: account.user,
      };
    });

    return apiSuccess({ accounts: serializedAccounts });
  } catch (error) {
    return handleApiError(error);
  }
}
