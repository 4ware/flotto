import { describe, expect, test } from "bun:test";

import { dayBody, makeTour, toursBody } from "@/test/fixtures";
import { act, bodyOf, mockApi, renderHookWithProviders, waitFor } from "@/test/render";

import { toursQueryKey, useSetTourStatus, useTodaysTours, useTour, useTours } from "./tours";

const mine = makeTour({ id: "t1", vehicleId: "v1" });
const other = makeTour({ id: "t2", vehicleId: "v2" });

describe("useTours", () => {
  test("keeps only the chosen vehicle's tours", async () => {
    mockApi({ "GET /api/tours/": { body: toursBody([mine, other]) } });
    const { result } = await renderHookWithProviders(() => useTours("v1"));
    await waitFor(() => expect(result.current.data).toEqual([mine]));
  });

  test("lists every tour without a vehicle", async () => {
    mockApi({ "GET /api/tours/": { body: toursBody([mine, other]) } });
    const { result } = await renderHookWithProviders(() => useTours(null));
    await waitFor(() => expect(result.current.data).toEqual([mine, other]));
  });
});

describe("useTodaysTours", () => {
  test("loads today's tours and keeps the vehicle's", async () => {
    const fetch = mockApi({ "GET /api/tours/day": { body: dayBody([mine, other]) } });
    const { result } = await renderHookWithProviders(() => useTodaysTours("v1"));
    await waitFor(() => expect(result.current.data).toEqual([mine]));
    // No date: the server decides what "today" is (German time).
    expect(String(fetch.mock.calls[0][0])).toBe("http://api.test/api/tours/day");
  });

  test("waits until a vehicle is chosen", async () => {
    const fetch = mockApi({});
    const { result } = await renderHookWithProviders(() => useTodaysTours(null));
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useTour", () => {
  test("loads one tour by id", async () => {
    const fetch = mockApi({ "GET /api/tours/t%2F1": { body: makeTour({ id: "t/1" }) } });
    const { result } = await renderHookWithProviders(() => useTour("t/1"));
    await waitFor(() => expect(result.current.data?.id).toBe("t/1"));
    expect(String(fetch.mock.calls[0][0])).toEndWith("/api/tours/t%2F1");
  });

  test("shows the copy from a loaded list while fetching", async () => {
    mockApi({ "GET /api/tours/t1": () => new Promise(() => {}) });
    const { queryClient } = await renderHookWithProviders(() => null);
    queryClient.setQueryData(toursQueryKey, toursBody([mine]));

    const { result } = await renderHookWithProviders(() => useTour("t1"), { queryClient });
    expect(result.current.data).toEqual(mine);
    expect(result.current.isPlaceholderData).toBe(true);
  });
});

describe("useSetTourStatus", () => {
  test("patches the status and reloads the tour queries", async () => {
    const fetch = mockApi({ "PATCH /api/tours/t1/status": { body: { id: "t1" } } });
    const { result, queryClient } = await renderHookWithProviders(() => useSetTourStatus());
    queryClient.setQueryData(toursQueryKey, toursBody([mine]));

    await act(() => result.current.mutateAsync({ id: "t1", status: "started" }));

    expect(bodyOf(fetch.mock.calls[0])).toEqual({ status: "started" });
    expect((fetch.mock.calls[0][1] as RequestInit).method).toBe("PATCH");
    expect(queryClient.getQueryState(toursQueryKey)?.isInvalidated).toBe(true);
  });
});
