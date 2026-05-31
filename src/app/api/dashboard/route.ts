import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { getUserKycStatus } from "@/lib/customerProfile";
import { withPhotoCacheBuster } from "@/lib/memberAvatar";
import { getPrisma } from "@/lib/prisma";
import { getAccountDisplayName, maskAccountNumber } from "@/lib/bankingSerialize";
import type {
  DashboardAccount,
  DashboardCard,
  DashboardData,
  DashboardLoan,
  DashboardSupportTicket,
  DashboardTransaction,
  SupportTicketStatus,
} from "@/types/banking";

export const runtime = "nodejs";

function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function countTickets(tickets: { status: SupportTicketStatus; priority: string }[]) {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "OPEN").length,
    pending: tickets.filter((ticket) => ticket.status === "PENDING").length,
    resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
    closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    urgent: tickets.filter((ticket) => ticket.priority === "URGENT").length,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const [accounts, recentTransactions, cards, loans, supportTickets] = await Promise.all([
      prisma.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: {
          account: {
            select: {
              accountType: true,
              accountNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.card.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.loan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const serializedAccounts: DashboardAccount[] = accounts.map((account) => {
      const maskedAccount = maskAccountNumber(account.accountNumber);

      return {
        id: account.id,
        accountType: account.accountType,
        displayName: getAccountDisplayName(account.accountType),
        maskedAccountNumber: maskedAccount.masked,
        accountNumberLast4: maskedAccount.last4,
        balance: account.balance.toNumber(),
        availableBalance: account.availableBalance.toNumber(),
        currency: account.currency,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      };
    });

    const serializedTransactions: DashboardTransaction[] = recentTransactions.map((transaction) => {
      const maskedAccount = maskAccountNumber(transaction.account.accountNumber);

      return {
        id: transaction.id,
        accountId: transaction.accountId,
        accountType: transaction.account.accountType,
        maskedAccountNumber: maskedAccount.masked,
        type: transaction.type,
        amount: transaction.amount.toNumber(),
        description: transaction.description,
        merchant: transaction.merchant,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
      };
    });

    const serializedCards: DashboardCard[] = cards.map((card) => ({
      id: card.id,
      accountId: card.accountId,
      cardType: card.cardType,
      last4: card.last4,
      cardholderName: card.cardholderName,
      status: card.status,
      spendingLimit: card.spendingLimit.toNumber(),
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    }));

    const serializedLoans: DashboardLoan[] = loans.map((loan) => ({
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

    const serializedTickets: DashboardSupportTicket[] = supportTickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    }));

    const ticketCounts = countTickets(serializedTickets);
    const [kycStatus, customerProfile] = await Promise.all([
      getUserKycStatus(user.id),
      prisma.customerProfile.findUnique({
        where: { userId: user.id },
        select: { profilePhotoUrl: true, updatedAt: true },
      }),
    ]);

    const dashboardData: DashboardData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        firstName: getFirstName(user.fullName),
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePhotoUrl: withPhotoCacheBuster(
          customerProfile?.profilePhotoUrl ?? null,
          customerProfile?.updatedAt.toISOString() ?? null,
        ),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accounts: serializedAccounts,
      recentTransactions: serializedTransactions,
      cards: serializedCards,
      loans: serializedLoans,
      supportTicketSummary: {
        ...ticketCounts,
        recentTickets: serializedTickets.slice(0, 3),
      },
      kycSummary: {
        kycStatus,
        needsProfileCompletion:
          kycStatus === "NOT_STARTED" || kycStatus === "REJECTED",
      },
    };

    return apiSuccess(dashboardData);
  } catch (error) {
    return handleApiError(error);
  }
}
