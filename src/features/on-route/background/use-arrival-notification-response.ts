import { useEffect } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

import { ARRIVAL_NOTIFICATION } from "./arrival-notification";

/** Tapping the arrival notification opens the tour's on-route screen, where the modal asks. */
export function useArrivalNotificationResponse(enabled: boolean) {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!enabled || !response) return;
    const data = response.notification.request.content.data;
    if (data?.type !== ARRIVAL_NOTIFICATION || typeof data.tourId !== "string") return;
    router.push({ pathname: "/on-route/[id]", params: { id: data.tourId } });
    void Notifications.clearLastNotificationResponseAsync();
  }, [enabled, response]);
}
