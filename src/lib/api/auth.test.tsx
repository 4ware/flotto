import { describe, expect, test } from "bun:test";

import { getActiveTour, setActiveTour } from "@/features/on-route/background/active-tour";
import { session } from "@/test/fixtures";
import { act, bodyOf, mockApi, renderHookWithProviders, waitFor } from "@/test/render";

import { sessionQueryKey, useCurrentUser, useLogin, useLogout, useSession } from "./auth";

describe("useSession", () => {
  test("returns the signed-in user", async () => {
    mockApi({ "GET /api/session": { body: session } });
    const { result } = await renderHookWithProviders(() => useSession());
    await waitFor(() => expect(result.current.data).toEqual(session));
  });

  test("returns null when signed out (401)", async () => {
    mockApi({ "GET /api/session": { status: 401, body: { message: "Errors.loginRequired" } } });
    const { result } = await renderHookWithProviders(() => useSession());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  test("fails on other errors", async () => {
    mockApi({ "GET /api/session": { status: 500 } });
    const { result } = await renderHookWithProviders(() => useSession());
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useLogin", () => {
  test("posts the credentials, then loads the session", async () => {
    const fetch = mockApi({
      "POST /api/login": { body: { ok: true } },
      "GET /api/session": { body: session },
    });
    const { result, queryClient } = await renderHookWithProviders(() => useLogin());

    await act(() => result.current.mutateAsync({ email: "kai@example.com", password: "geheim123" }));

    expect(bodyOf(fetch.mock.calls[0])).toEqual({ email: "kai@example.com", password: "geheim123" });
    expect(queryClient.getQueryData(sessionQueryKey)).toEqual(session);
  });

  test("fails with the translated API message", async () => {
    mockApi({ "POST /api/login": { status: 401, body: { message: "Errors.wrongCredentials" } } });
    const { result } = await renderHookWithProviders(() => useLogin());
    await act(() =>
      expect(result.current.mutateAsync({ email: "a@b.de", password: "x" })).rejects.toThrow(
        "E-Mail-Adresse oder Passwort ist falsch.",
      ),
    );
  });
});

describe("useLogout", () => {
  test("signs out locally, drops other data and stops tour tracking", async () => {
    mockApi({ "POST /api/logout": { body: { ok: true } } });
    const { result, queryClient } = await renderHookWithProviders(() => useLogout());
    queryClient.setQueryData(sessionQueryKey, session);
    queryClient.setQueryData(["tours", "all"], { tours: [] });
    setActiveTour({
      tourId: "tour-1",
      vehicleId: "vehicle-1",
      destination: { latitude: 1, longitude: 2 },
      destinationAddress: "Ziel",
      position: null,
      reportedAt: null,
      reportError: null,
      askArrival: false,
    });

    await act(() => result.current.mutateAsync());

    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
    expect(queryClient.getQueryData(["tours", "all"])).toBeUndefined();
    expect(getActiveTour()).toBeNull();
  });

  test("signs out locally even when the request fails", async () => {
    mockApi({ "POST /api/logout": { status: 500 } });
    const { result, queryClient } = await renderHookWithProviders(() => useLogout());
    queryClient.setQueryData(sessionQueryKey, session);

    await act(() => result.current.mutateAsync().catch(() => {}));

    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
  });
});

describe("useCurrentUser", () => {
  test("derives first name and initials", async () => {
    mockApi({});
    const { result, queryClient } = await renderHookWithProviders(() => useSession());
    await act(() => queryClient.setQueryData(sessionQueryKey, session));
    expect(result.current.data).toEqual(session);

    const user = (await renderHookWithProviders(() => useCurrentUser(), { queryClient })).result.current;
    expect(user.firstName).toBe("Kai");
    expect(user.initials).toBe("KB");
    expect(user.organization?.role).toBe("driver");
  });

  test("uses the first two letters for a single name", async () => {
    mockApi({});
    const { queryClient } = await renderHookWithProviders(() => null);
    queryClient.setQueryData(sessionQueryKey, { ...session, user: { ...session.user, name: "kai" } });

    const user = (await renderHookWithProviders(() => useCurrentUser(), { queryClient })).result.current;
    expect(user.initials).toBe("KA");
  });

  test("keeps the last user while a screen is removed after sign-out", async () => {
    mockApi({});
    const { queryClient } = await renderHookWithProviders(() => null);
    queryClient.setQueryData(sessionQueryKey, session);
    const { result } = await renderHookWithProviders(() => useCurrentUser(), { queryClient });

    await act(() => queryClient.setQueryData(sessionQueryKey, null));

    expect(result.current.name).toBe("Kai Beispiel");
  });

  test("throws outside the signed-in area", async () => {
    mockApi({ "GET /api/session": { status: 401 } });
    const { queryClient } = await renderHookWithProviders(() => null);
    queryClient.setQueryData(sessionQueryKey, null);
    await expect(renderHookWithProviders(() => useCurrentUser(), { queryClient })).rejects.toThrow(
      "useCurrentUser() used outside the signed-in area",
    );
  });
});
