import { describe, expect, test } from "bun:test";
import { Platform } from "react-native";

import { messages } from "@/lib/messages";
import { mockApi } from "@/test/render";

import { API_URL, ApiError, apiFetch, isUnauthorized } from "./client";

/** The ApiError a call fails with. */
const failure = (call: Promise<unknown>) =>
  call.then(
    () => {
      throw new Error("expected the call to fail");
    },
    (error: ApiError) => error,
  );

describe("apiFetch", () => {
  test("uses the configured API URL", () => {
    expect(API_URL).toBe("http://api.test");
  });

  test("returns the JSON answer", async () => {
    mockApi({ "GET /api/thing": { body: { ok: true } } });
    expect(await apiFetch("/api/thing")).toEqual({ ok: true });
  });

  test("sends JSON bodies with credentials", async () => {
    const fetch = mockApi({ "POST /api/thing": { body: { ok: true } } });
    await apiFetch("/api/thing", { method: "POST", body: { a: 1 } });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/thing");
    expect(init.body).toBe('{"a":1}');
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({ Accept: "application/json", "Content-Type": "application/json" });
  });

  test("leaves out Content-Type without a body", async () => {
    const fetch = mockApi({ "GET /api/thing": { body: {} } });
    await apiFetch("/api/thing");
    expect((fetch.mock.calls[0] as [string, RequestInit])[1].headers).not.toHaveProperty("Content-Type");
  });

  test("identifies the native app with expo-origin", async () => {
    const fetch = mockApi({ "GET /api/thing": { body: {} } });
    await apiFetch("/api/thing");
    expect((fetch.mock.calls[0] as [string, RequestInit])[1].headers).toMatchObject({ "expo-origin": "flotto://" });
  });

  test("sends no expo-origin on web, where the browser sends Origin", async () => {
    Platform.OS = "web";
    const fetch = mockApi({ "GET /api/thing": { body: {} } });
    await apiFetch("/api/thing");
    expect((fetch.mock.calls[0] as [string, RequestInit])[1].headers).not.toHaveProperty("expo-origin");
  });

  test("throws an ApiError with the translated message", async () => {
    mockApi({ "POST /api/login": { status: 401, body: { message: "Errors.wrongCredentials" } } });
    const error = await failure(apiFetch("/api/login", { method: "POST", body: {} }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.key).toBe("Errors.wrongCredentials");
    expect(error.message).toBe(messages.Errors.wrongCredentials);
  });

  test("says 'too many requests' for 429, whatever the body", async () => {
    mockApi({ "GET /api/thing": { status: 429 } });
    const error = await failure(apiFetch("/api/thing"));
    expect(error.message).toBe(messages.Errors.tooManyRequests);
  });

  test("uses the generic message when the error has no JSON body", async () => {
    mockApi({ "GET /api/thing": { status: 500 } });
    const error = await failure(apiFetch("/api/thing"));
    expect(error.status).toBe(500);
    expect(error.message).toBe(messages.Errors.generic);
  });
});

describe("isUnauthorized", () => {
  test("is true only for API 401s", () => {
    expect(isUnauthorized(new ApiError(401, undefined))).toBe(true);
    expect(isUnauthorized(new ApiError(403, undefined))).toBe(false);
    expect(isUnauthorized(new Error("401"))).toBe(false);
  });
});
