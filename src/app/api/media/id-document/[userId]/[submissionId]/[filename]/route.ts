import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { serveUploadFile } from "@/lib/mediaServe";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { resolveIdDocumentFilePath } from "@/lib/uploadStorage";

export const runtime = "nodejs";

const FILENAME_PATTERN = /^(front|back)\.(jpg|jpeg|png|webp)$/i;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string; submissionId: string; filename: string }> },
) {
  try {
    const auth = await resolveRequestAuth(request, { touch: false });
    if (!auth.ok) {
      return auth.response;
    }

    const { userId, submissionId, filename } = await context.params;
    const match = FILENAME_PATTERN.exec(filename);

    if (!match) {
      return apiError("Document not found.", 404);
    }

    if (auth.payload.role !== "ADMIN" && auth.payload.userId !== userId) {
      return apiError("Document not found.", 404);
    }

    const side = match[1].toLowerCase() as "front" | "back";
    const extension = match[2].toLowerCase();
    const absolutePath = resolveIdDocumentFilePath(userId, submissionId, side, extension);

    return await serveUploadFile(absolutePath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return apiError("Document not found.", 404);
    }

    return handleApiError(error);
  }
}
