import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api";
import { sendAdminAlertEmail, sendContactConfirmationEmail } from "@/lib/email";
import { writeEventLog } from "@/lib/eventLog";
import { contactFormSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = contactFormSchema.parse(await request.json());
    const reference = `BW-${randomUUID().slice(0, 8).toUpperCase()}`;

    void writeEventLog({
      eventType: "CONTACT_FORM_SUBMITTED",
      entityType: "Contact",
      entityId: reference,
      message: `Public contact form submitted by ${input.fullName}.`,
      severity: "INFO",
      metadata: {
        email: input.email,
        topic: input.topic,
      },
    });

    void sendAdminAlertEmail({
      subject: `Contact form: ${input.topic}`,
      message: `${input.fullName} (${input.email}) wrote: ${input.message}`,
      idempotencyKey: `contact-form/${reference}`,
    });

    void sendContactConfirmationEmail({
      email: input.email,
      fullName: input.fullName,
      topic: input.topic,
      reference,
    });

    return apiSuccess({ reference });
  } catch (error) {
    return handleApiError(error);
  }
}
