import { describe, expect, test } from "bun:test";

import { notifications, router, tapNotification } from "@/test/native-mocks";
import { act, renderHook } from "@/test/render";

import { useArrivalNotificationResponse } from "./use-arrival-notification-response";

describe("useArrivalNotificationResponse", () => {
  test("tapping the arrival notification opens the tour's route screen", async () => {
    await renderHook(() => useArrivalNotificationResponse(true));

    await act(() => tapNotification({ type: "arrival", tourId: "tour-1" }));

    expect(router.push).toHaveBeenCalledWith({ pathname: "/on-route/[id]", params: { id: "tour-1" } });
    expect(notifications.clearLastNotificationResponseAsync).toHaveBeenCalled();
  });

  test("waits until the signed-in screens exist", async () => {
    const { rerender } = await renderHook(({ enabled }: { enabled: boolean }) => useArrivalNotificationResponse(enabled), {
      initialProps: { enabled: false },
    });
    await act(() => tapNotification({ type: "arrival", tourId: "tour-1" }));
    expect(router.push).not.toHaveBeenCalled();

    await rerender({ enabled: true });

    expect(router.push).toHaveBeenCalledTimes(1);
  });

  test("ignores other notifications", async () => {
    await renderHook(() => useArrivalNotificationResponse(true));
    await act(() => tapNotification({ type: "something-else", tourId: "tour-1" }));
    await act(() => tapNotification({ type: "arrival" }));
    expect(router.push).not.toHaveBeenCalled();
  });
});
