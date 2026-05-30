import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { serializeEventLog } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import { getReconciliationSummary } from "@/lib/reconciliation";
import type {
  AdminAuditLogRecord,
  AdminCommandCenterData,
  AdminOperationalAlert,
  AdminSupportTicketRecord,
  AdminTransactionRecord,
  AdminUserSummary,
  KycStatus,
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

async function buildOperationalAlerts(prisma: ReturnType<typeof getPrisma>): Promise<AdminOperationalAlert[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    pendingTransfers,
    failedTransfers,
    openSupportTickets,
    recentSecurityEvents,
    urgentSupportTickets,
    pendingUsers,
    pendingBillPayments,
    openDisputes,
    pendingKyc,
  ] = await Promise.all([
    prisma.transaction.count({ where: { type: "TRANSFER", status: "PENDING" } }),
    prisma.transaction.count({
      where: {
        type: "TRANSFER",
        status: "FAILED",
        reviewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.notification.count({
      where: { type: "SECURITY", createdAt: { gte: since } },
    }),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "PENDING"] }, priority: "URGENT" },
    }),
    prisma.user.count({ where: { status: "PENDING", role: "USER" } }),
    prisma.billPayment.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.customerProfile.count({
      where: { kycStatus: { in: ["SUBMITTED", "UNDER_REVIEW"] as KycStatus[] } },
    }),
  ]);

  const alerts: AdminOperationalAlert[] = [];

  if (pendingUsers > 0) {
    alerts.push({
      id: "pending-memberships",
      type: "ACCOUNT",
      severity: "warning",
      title: "Pending membership applications",
      message: `${pendingUsers} membership application${pendingUsers === 1 ? "" : "s"} awaiting review.`,
      href: "/admin/users",
      createdAt: new Date().toISOString(),
    });
  }

  if (pendingKyc > 0) {
    alerts.push({
      id: "pending-kyc",
      type: "ACCOUNT",
      severity: "warning",
      title: "Pending KYC reviews",
      message: `${pendingKyc} profile${pendingKyc === 1 ? "" : "s"} awaiting identity verification.`,
      href: "/admin/compliance",
      createdAt: new Date().toISOString(),
    });
  }

  if (pendingTransfers > 0) {
    alerts.push({
      id: "pending-transfers",
      type: "TRANSFER",
      severity: "warning",
      title: "Pending transfer reviews",
      message: `${pendingTransfers} transfer request${pendingTransfers === 1 ? "" : "s"} awaiting approval.`,
      href: "/admin/transfer-reviews",
      createdAt: new Date().toISOString(),
    });
  }

  if (pendingBillPayments > 0) {
    alerts.push({
      id: "pending-bill-pay",
      type: "TRANSFER",
      severity: "warning",
      title: "Pending bill pay reviews",
      message: `${pendingBillPayments} bill payment${pendingBillPayments === 1 ? "" : "s"} awaiting approval.`,
      href: "/admin/bill-pay",
      createdAt: new Date().toISOString(),
    });
  }

  if (openDisputes > 0) {
    alerts.push({
      id: "open-disputes",
      type: "SUPPORT",
      severity: "warning",
      title: "Open disputes",
      message: `${openDisputes} dispute${openDisputes === 1 ? "" : "s"} require review.`,
      href: "/admin/disputes",
      createdAt: new Date().toISOString(),
    });
  }

  if (failedTransfers > 0) {
    alerts.push({
      id: "failed-transfers",
      type: "TRANSFER",
      severity: "info",
      title: "Recent failed transfer reviews",
      message: `${failedTransfers} transfer review${failedTransfers === 1 ? "" : "s"} marked failed in the last 7 days.`,
      href: "/admin/transactions",
      createdAt: new Date().toISOString(),
    });
  }

  if (openSupportTickets > 0) {
    alerts.push({
      id: "open-support",
      type: "SUPPORT",
      severity: urgentSupportTickets > 0 ? "warning" : "info",
      title: "Open support tickets",
      message: `${openSupportTickets} open ticket${openSupportTickets === 1 ? "" : "s"} need attention.`,
      href: "/admin/support",
      createdAt: new Date().toISOString(),
    });
  }

  if (recentSecurityEvents > 0) {
    alerts.push({
      id: "security-events",
      type: "SECURITY",
      severity: "info",
      title: "Recent sign-in activity",
      message: `${recentSecurityEvents} security notification${recentSecurityEvents === 1 ? "" : "s"} in the last 24 hours.`,
      href: "/admin/sessions",
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const prisma = getPrisma();
    const now = new Date();

    const [
      totalMembers,
      activeMembers,
      pendingMemberships,
      pendingKyc,
      pendingTransfers,
      pendingBillPayments,
      openDisputes,
      openSupportTickets,
      highRiskEvents,
      dueJobs,
      failedJobs,
      totalAccounts,
      totalTransactions,
      recentUsers,
      recentTransactions,
      recentSupportTickets,
      recentAdminActivity,
      recentEvents,
      reconciliation,
      alerts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "USER", status: "PENDING" } }),
      prisma.customerProfile.count({
        where: { kycStatus: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }),
      prisma.transaction.count({ where: { type: "TRANSFER", status: "PENDING" } }),
      prisma.billPayment.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
      prisma.riskEvent.count({
        where: { severity: { in: ["HIGH", "CRITICAL"] } },
      }),
      prisma.jobQueue.count({
        where: { status: "QUEUED", runAt: { lte: now } },
      }),
      prisma.jobQueue.count({ where: { status: "FAILED" } }),
      prisma.account.count(),
      prisma.transaction.count(),
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
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { admin: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
      getReconciliationSummary(),
      buildOperationalAlerts(prisma),
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

    const serializedAuditLogs: AdminAuditLogRecord[] = recentAdminActivity.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: (log.details as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt.toISOString(),
      admin: log.admin,
    }));

    const data: AdminCommandCenterData = {
      metrics: {
        totalMembers,
        activeMembers,
        pendingMemberships,
        pendingKyc,
        pendingTransfers,
        pendingBillPayments,
        openDisputes,
        openSupportTickets,
        highRiskEvents,
        reconciliationMismatches: reconciliation.totals.mismatchCount,
        dueJobs,
        failedJobs,
        totalAccounts,
        totalTransactions,
      },
      alerts,
      recentAdminActivity: serializedAuditLogs,
      recentEvents: recentEvents.map(serializeEventLog),
      recentUsers: recentUsers.map(serializeUser),
      recentTransactions: serializedTransactions,
      recentSupportTickets: serializedTickets,
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
