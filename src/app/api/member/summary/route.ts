import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getUserKycStatus } from "@/lib/customerProfile";
import { getPrisma } from "@/lib/prisma";
import type { MemberSummary } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const prisma = getPrisma();
    const userId = payload.userId;

    const [
      accounts,
      pendingTransfers,
      pendingBillPayments,
      openDisputes,
      unreadNotifications,
      openSupportTickets,
      activeSessions,
      kycStatus,
    ] = await Promise.all([
      prisma.account.findMany({ where: { userId }, select: { availableBalance: true } }),
      prisma.transaction.count({
        where: { userId, type: "TRANSFER", status: "PENDING" },
      }),
      prisma.billPayment.count({
        where: { userId, status: { in: ["PENDING_REVIEW", "APPROVED"] } },
      }),
      prisma.dispute.count({
        where: { userId, status: { in: ["OPEN", "UNDER_REVIEW"] } },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.supportTicket.count({
        where: { userId, status: { in: ["OPEN", "PENDING"] } },
      }),
      prisma.userSession.count({ where: { userId, revokedAt: null } }),
      getUserKycStatus(userId),
    ]);

    const totalAvailableBalance = accounts.reduce(
      (sum, account) => sum + account.availableBalance.toNumber(),
      0,
    );

    const summary: MemberSummary = {
      totalAvailableBalance,
      pendingTransferCount: pendingTransfers,
      pendingBillPaymentCount: pendingBillPayments,
      openDisputeCount: openDisputes,
      unreadNotificationCount: unreadNotifications,
      openSupportTicketCount: openSupportTickets,
      kycStatus,
      needsProfileCompletion: kycStatus === "NOT_STARTED" || kycStatus === "REJECTED",
      activeSessionCount: activeSessions,
    };

    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
