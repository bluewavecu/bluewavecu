import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import type { AdminOperationalAlertsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const prisma = getPrisma();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingTransfers,
      failedTransfers,
      openSupportTickets,
      recentSecurityEvents,
      urgentSupportTickets,
      pendingUsers,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { type: "TRANSFER", status: "PENDING" },
      }),
      prisma.transaction.count({
        where: {
          type: "TRANSFER",
          status: "FAILED",
          reviewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.supportTicket.count({
        where: { status: "OPEN" },
      }),
      prisma.notification.count({
        where: {
          type: "SECURITY",
          createdAt: { gte: since },
        },
      }),
      prisma.supportTicket.count({
        where: {
          status: { in: ["OPEN", "PENDING"] },
          priority: "URGENT",
        },
      }),
      prisma.user.count({
        where: { status: "PENDING", role: "USER" },
      }),
    ]);

    const alerts: AdminOperationalAlertsData["alerts"] = [];

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

    if (pendingTransfers > 0) {
      alerts.push({
        id: "pending-transfers",
        type: "TRANSFER",
        severity: "warning",
        title: "Pending transfer reviews",
        message: `${pendingTransfers} transfer request${pendingTransfers === 1 ? "" : "s"} awaiting admin approval.`,
        href: "/admin/transactions",
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
        message: `${recentSecurityEvents} security notification${recentSecurityEvents === 1 ? "" : "s"} recorded in the last 24 hours.`,
        href: "/admin/audit-logs",
        createdAt: new Date().toISOString(),
      });
    }

    return apiSuccess({ alerts } satisfies AdminOperationalAlertsData);
  } catch (error) {
    return handleApiError(error);
  }
}
