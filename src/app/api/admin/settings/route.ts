import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getBankingPolicy } from "@/lib/bankingPolicy";
import { getEmailConfig } from "@/lib/email";
import { getServerEnv } from "@/lib/env";
import type { AdminSettingsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { NODE_ENV } = getServerEnv();
    const emailConfig = getEmailConfig();
    const bankingPolicy = await getBankingPolicy();

    const data: AdminSettingsData = {
      environment: NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
      emailConfigured: Boolean(emailConfig.resendApiKey),
      adminAlertEmail: emailConfig.adminAlertEmail,
      cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
      demoSeedProtected: process.env.ALLOW_DEMO_SEED !== "true",
      systemMode: NODE_ENV === "production" ? "Production" : "Development",
      featureFlags: {
        billPayReview: true,
        transferReview: bankingPolicy.requireTransferReview,
        transactionOtp: bankingPolicy.requireTransactionOtp,
        kycReview: true,
        scheduledJobs: true,
        financeReports: true,
      },
      bankingPolicy,
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
