import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { serveUploadFile } from "@/lib/mediaServe";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { resolveProfilePhotoFilePath } from "@/lib/uploadStorage";

export const runtime = "nodejs";

const FILENAME_PATTERN = /^([a-z0-9]+)\.([a-z0-9]+)$/i;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  try {
    const auth = await resolveRequestAuth(request, { touch: false });
    if (!auth.ok) {
      return auth.response;
    }

    const { filename } = await context.params;
    const match = FILENAME_PATTERN.exec(filename);

    if (!match) {
      return apiError("Photo not found.", 404);
    }

    const [, userId, extension] = match;

    if (auth.payload.role !== "ADMIN" && auth.payload.userId !== userId) {
      return apiError("Photo not found.", 404);
    }

    const absolutePath = resolveProfilePhotoFilePath(userId, extension);

    return await serveUploadFile(absolutePath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return apiError("Photo not found.", 404);
    }

    return handleApiError(error);
  }
}
