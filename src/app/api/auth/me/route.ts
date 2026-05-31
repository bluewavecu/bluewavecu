import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { sanitizeUser } from "@/lib/auth";
import { withPhotoCacheBuster } from "@/lib/memberAvatar";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      include: {
        customerProfile: {
          select: {
            profilePhotoUrl: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const profilePhotoUrl = withPhotoCacheBuster(
      user.customerProfile?.profilePhotoUrl ?? null,
      user.customerProfile?.updatedAt.toISOString() ?? null,
    );

    return apiSuccess({
      user: sanitizeUser(user),
      profilePhotoUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
