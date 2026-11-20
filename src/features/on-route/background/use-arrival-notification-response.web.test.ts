import { describe, expect, test } from "bun:test";

import { router, tapNotification } from "@/test/native-mocks";
import { act, renderHook } from "@/test/render";

import { useArrivalNotificationResponse } from "./use-arrival-notification-response.web";

describe("useArrivalNotificationResponse (web)", () => {
  test("does nothing: there are no arrival notifications on web", async () => {
    await renderHook(() => useArrivalNotificationResponse(true));
    await act(() => tapNotification({ type: "arrival", tourId: "tour-1" }));
    expect(router.push).not.toHaveBeenCalled();
  });
});
