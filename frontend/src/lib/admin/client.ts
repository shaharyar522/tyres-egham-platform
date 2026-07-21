import { getApiBaseUrl, ApiError, parseJson } from "@/lib/api/client";
import { getAdminToken, clearAdminSession } from "@/lib/admin/auth";

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new ApiError("Not authenticated.", 401);
  }

  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const response = await fetch(`${getApiBaseUrl()}/admin${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(!isFormData && init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  return parseJson<T>(response);
}

export function adminGet<T>(path: string) {
  return adminFetch<T>(path);
}

export function adminPost<T>(path: string, body?: unknown) {
  return adminFetch<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function adminPut<T>(path: string, body: unknown) {
  return adminFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function adminPatch<T>(path: string, body: unknown) {
  return adminFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function adminDelete<T>(path: string) {
  return adminFetch<T>(path, { method: "DELETE" });
}

export function adminPostFormData<T>(path: string, formData: FormData) {
  return adminFetch<T>(path, { method: "POST", body: formData });
}
