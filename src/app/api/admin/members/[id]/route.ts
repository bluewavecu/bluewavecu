import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { maskAccountNumber, getAccountDisplayName } from "@/lib/bankingSerialize";
import { serializeCustomerProfile } from "@/lib/customerProfile";
import { serializeEventLog } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import type {
  AdminAccountRecord,
  AdminMemberDetailData,
  AdminTransactionRecord,
  AdminUserSummary,
} from "@/types/banking";

export const runtime = "nodejs";

function serializeUser(user: {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: AdminUserSummary["role"];
  status: AdminUserSummary["status"];
  transactionsUnrestricted: boolean;
  transactionPinHash: string | null;
  statusNote: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserSummary {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    transactionsUnrestricted: user.transactionsUnrestricted,
    hasTransactionPin: Boolean(user.transactionPinHash),
    statusNote: user.statusNote,
    deletedAt: user.deletedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

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
      include: {
        customerProfile: true,
        accounts: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      return apiError("Member not found", 404);
    }

    const [
      recentTransactions,
      openTicketCount,
      openDisputeCount,
      activeSessionCount,
      highRiskEventCount,
      recentEvents,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          account: { select: { id: true, accountType: true, accountNumber: true } },
        },
      }),
      prisma.supportTicket.count({
        where: { userId: id, status: { in: ["OPEN", "PENDING"] } },
      }),
      prisma.dispute.count({
        where: { userId: id, status: { in: ["OPEN", "UNDER_REVIEW"] } },
      }),
      prisma.userSession.count({ where: { userId: id, isActive: true } }),
      prisma.riskEvent.count({
        where: { userId: id, severity: { in: ["HIGH", "CRITICAL"] } },
      }),
      prisma.eventLog.findMany({
        where: {
          OR: [{ actorId: id }, { entityId: id }],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const accounts: AdminAccountRecord[] = user.accounts.map((account) => {
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
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          status: user.status,
        },
      };
    });

    const serializedTransactions: AdminTransactionRecord[] = recentTransactions.map(
      (transaction) => {
        const masked = maskAccountNumber(transaction.account.accountNumber);

        return {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount.toNumber(),
          description: transaction.description,
          merchant: transaction.merchant,
          reference: transaction.reference,
          status: transaction.status,
          createdAt: transaction.createdAt.toISOString(),
          user: transaction.user,
          account: {
            id: transaction.account.id,
            accountType: transaction.account.accountType,
            maskedAccountNumber: masked.masked,
          },
        };
      },
    );

    const data: AdminMemberDetailData = {
      user: {
        ...serializeUser(user),
        kycStatus: user.customerProfile?.kycStatus ?? null,
      },
      profile: user.customerProfile ? serializeCustomerProfile(user.customerProfile) : null,
      accounts,
      recentTransactions: serializedTransactions,
      openTicketCount,
      openDisputeCount,
      activeSessionCount,
      highRiskEventCount,
      recentEvents: recentEvents.map(serializeEventLog),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
