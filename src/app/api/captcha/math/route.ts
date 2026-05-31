import { apiSuccess, handleApiError } from "@/lib/api";
import { createMathChallenge } from "@/lib/mathChallenge";

export const runtime = "nodejs";

export async function GET() {
  try {
    const challenge = createMathChallenge();
    return apiSuccess(challenge);
  } catch (error) {
    return handleApiError(error);
  }
}
