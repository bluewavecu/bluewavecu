import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { removeProfilePhoto, saveProfilePhoto } from "@/lib/profilePhoto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const formData = await request.formData();
    const file = formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      return apiError("Choose a photo to upload.", 400);
    }

    const profilePhotoUrl = await saveProfilePhoto({
      userId: payload.userId,
      file,
    });

    return apiSuccess({ profilePhotoUrl });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Upload")) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    await removeProfilePhoto(payload.userId);

    return apiSuccess({ profilePhotoUrl: null });
  } catch (error) {
    return handleApiError(error);
  }
}
