import type { ApiResponse } from "@/types/banking";

async function requestJson<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH",
  body: unknown,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
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
      error: "Unable to reach Bluewave services. Please try again shortly.",
    };
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return requestJson<T>(url, "POST", body);
}

export async function putJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return requestJson<T>(url, "PUT", body);
}

export async function patchJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return requestJson<T>(url, "PATCH", body);
}

export async function getJson<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
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
      error: "Unable to reach Bluewave services. Please try again shortly.",
    };
  }
}
