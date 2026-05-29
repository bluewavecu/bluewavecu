import type { ApiResponse } from "@/types/banking";

export async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok && payload.success) {
      return {
        success: false,
        error: "Request failed. Please try again.",
      };
    }

    return payload;
  } catch {
    return {
      success: false,
      error: "Unable to reach Bluewave services. Check the local API setup.",
    };
  }
}

export async function getJson<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok && payload.success) {
      return {
        success: false,
        error: "Request failed. Please try again.",
      };
    }

    return payload;
  } catch {
    return {
      success: false,
      error: "Unable to reach Bluewave services. Check the local API setup.",
    };
  }
}
