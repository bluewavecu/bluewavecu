import { apiSuccess, handleApiError } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = apiSuccess({ message: "Signed out successfully." });
    response.cookies.set(clearAuthCookie());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
