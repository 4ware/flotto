import { describe, expect, test } from "bun:test";

import { sessionQueryKey } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { session } from "@/test/fixtures";

import { queryClient } from "./query-client";

const retry = queryClient.getDefaultOptions().queries?.retry as (count: number, error: unknown) => boolean;

describe("queryClient", () => {
  test("doesn't retry client errors", () => {
    expect(retry(0, new ApiError(404, undefined))).toBe(false);
    expect(retry(0, new ApiError(401, undefined))).toBe(false);
  });

  test("retries server and network errors twice", () => {
    expect(retry(0, new ApiError(503, undefined))).toBe(true);
    expect(retry(1, new TypeError("Network request failed"))).toBe(true);
    expect(retry(2, new TypeError("Network request failed"))).toBe(false);
  });

  test("a 401 from any query signs the user out", async () => {
    queryClient.setQueryData(sessionQueryKey, session);
    await queryClient
      .fetchQuery({
        queryKey: ["needs-login"],
        queryFn: () => Promise.reject(new ApiError(401, "Errors.loginRequired")),
        retry: false,
      })
      .catch(() => {});
    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
  });

  test("other errors leave the session alone", async () => {
    queryClient.setQueryData(sessionQueryKey, session);
    await queryClient
      .fetchQuery({ queryKey: ["broken"], queryFn: () => Promise.reject(new ApiError(500, undefined)), retry: false })
      .catch(() => {});
    expect(queryClient.getQueryData(sessionQueryKey)).toEqual(session);
  });
});
