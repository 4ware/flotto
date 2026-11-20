import { Platform } from "react-native";

import { translateMessageKey } from "@/lib/messages";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5173").replace(/\/$/, "");

/** The app's scheme from app.json; the API lists it in better-auth's trustedOrigins. */
const APP_ORIGIN = "flotto://";

/** A non-2xx answer from the API. `message` is already translated for display. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly key: string | undefined,
  ) {
    super(status === 429 ? translateMessageKey("Errors.tooManyRequests") : translateMessageKey(key));
    this.name = "ApiError";
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * JSON fetch against the flot.to API. Auth is the better-auth session cookie set by
 * POST /api/login; the native networking layer keeps and resends it (cookie jar), and
 * `credentials: "include"` does the same on web.
 */
export async function apiFetch<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      // Native requests carry no Origin; better-auth's Expo plugin checks this one instead.
      ...(Platform.OS !== "web" && { "expo-origin": APP_ORIGIN }),
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new ApiError(response.status, typeof data?.message === "string" ? data.message : undefined);
  }
  return data as T;
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;
