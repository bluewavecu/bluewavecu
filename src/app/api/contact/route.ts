import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api";
import { sendContactConfirmationEmail, sendContactFormAdminEmail } from "@/lib/email";
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

    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailPayload = {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      topic: input.topic,
      message: input.message,
      reference,
      submittedAt,
    };

    void sendContactFormAdminEmail(emailPayload);
    void sendContactConfirmationEmail(emailPayload);

    return apiSuccess({ reference });
  } catch (error) {
    return handleApiError(error);
  }
}
