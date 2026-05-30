import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type {
  AdminOverviewData,
  AdminSupportTicketRecord,
  AdminTransactionRecord,
  AdminUserSummary,
} from "@/types/banking";

export const runtime = "nodejs";

function serializeUser(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AdminUserSummary["role"];
  status: AdminUserSummary["status"];
  createdAt: Date;
  updatedAt: Date;
}): AdminUserSummary {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const prisma = getPrisma();

    const [
      users,
      activeUsers,
      pendingUsers,
      accounts,
      transactions,
      pendingTransfers,
      supportTickets,
      recentUsers,
      recentTransactions,
      recentSupportTickets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.transaction.count({
        where: { type: "TRANSFER", status: "PENDING" },
      }),
      prisma.supportTicket.count(),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          account: { select: { id: true, accountType: true, accountNumber: true } },
        },
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

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

    const serializedTickets: AdminSupportTicketRecord[] = recentSupportTickets.map(
      (ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        user: ticket.user,
      }),
    );

    const data: AdminOverviewData = {
      counts: {
        users,
        activeUsers,
        pendingUsers,
        accounts,
        transactions,
        pendingTransfers,
        supportTickets,
      },
      recentUsers: recentUsers.map(serializeUser),
      recentTransactions: serializedTransactions,
      recentSupportTickets: serializedTickets,
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
