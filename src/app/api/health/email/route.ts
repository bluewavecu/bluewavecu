import { apiSuccess } from "@/lib/api";
import { getEmailDeliveryStatus } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  const status = getEmailDeliveryStatus();

  return apiSuccess({
    deliveryConfigured: status.configured,
    fromDomain: status.fromDomain,
    fromDomainMatches: status.fromDomainMatches,
    appUrl: status.appUrl,
  });
}
