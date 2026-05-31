import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { documentTypeRequiresBackPhoto } from "@/lib/idVerificationShared";
import { getMemberIdVerificationData, submitIdVerification } from "@/lib/idVerification";
import { idDocumentTypeSchema } from "@/lib/validators";
import type { IdDocumentType } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const data = await getMemberIdVerificationData(payload.userId);

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const formData = await request.formData();
    const documentTypeRaw = formData.get("documentType");
    const frontPhoto = formData.get("frontPhoto");
    const backPhoto = formData.get("backPhoto");

    const documentTypeResult = idDocumentTypeSchema.safeParse(documentTypeRaw);

    if (!documentTypeResult.success) {
      return apiError("Select a valid ID document type.", 400);
    }

    if (!(frontPhoto instanceof File) || frontPhoto.size === 0) {
      return apiError("Upload a clear photo of the front of your ID.", 400);
    }

    const documentType = documentTypeResult.data as IdDocumentType;
    const requiresBack = documentTypeRequiresBackPhoto(documentType);
    const backFile = backPhoto instanceof File && backPhoto.size > 0 ? backPhoto : null;

    if (requiresBack && !backFile) {
      return apiError("Upload both the front and back of your ID.", 400);
    }

    const submission = await submitIdVerification({
      userId: payload.userId,
      documentType,
      frontPhoto,
      backPhoto: backFile,
    });

    return apiSuccess({
      submission,
      message: "Your ID photos were submitted for review.",
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
