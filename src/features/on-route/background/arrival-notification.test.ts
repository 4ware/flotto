import { describe, expect, test } from "bun:test";
import { Platform } from "react-native";

import { notifications } from "@/test/native-mocks";

import { ARRIVAL_NOTIFICATION, notifyArrival, prepareNotifications, showNotification } from "./arrival-notification";

describe("prepareNotifications", () => {
  test("creates the Android channel, then asks for permission", async () => {
    expect(await prepareNotifications()).toBe(true);
    expect(notifications.setNotificationChannelAsync).toHaveBeenCalledWith("arrival", {
      name: "Ankunft am Ziel",
      importance: notifications.AndroidImportance.HIGH,
    });
    expect(notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  test("needs no channel on iOS", async () => {
    Platform.OS = "ios";
    await prepareNotifications();
    expect(notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  test("never throws, e.g. when Expo Go rejects the channel", async () => {
    notifications.setNotificationChannelAsync.mockImplementationOnce(() => Promise.reject(new Error("NPE")));
    expect(await prepareNotifications()).toBe(false);
  });

  test("reports a denied permission", async () => {
    notifications.requestPermissionsAsync.mockImplementationOnce(async () => ({ granted: false, status: "denied" }));
    expect(await prepareNotifications()).toBe(false);
  });
});

describe("notifyArrival", () => {
  test("shows the arrival notification right away, on the arrival channel", async () => {
    await notifyArrival("tour-1", "Bahnhofsweg 1");
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "Ziel erreicht?",
        body: "Bahnhofsweg 1 – tippen, um die Tour abzuschließen.",
        data: { type: ARRIVAL_NOTIFICATION, tourId: "tour-1" },
      },
      trigger: { channelId: "arrival" },
    });
  });

  test("uses an immediate trigger on iOS", async () => {
    Platform.OS = "ios";
    await notifyArrival("tour-1", "Bahnhofsweg 1");
    expect(notifications.scheduleNotificationAsync.mock.calls[0][0]).toMatchObject({ trigger: null });
  });

  test("swallows failures", async () => {
    notifications.scheduleNotificationAsync.mockImplementationOnce(() => Promise.reject(new Error("nope")));
    await expect(notifyArrival("tour-1", "Bahnhofsweg 1")).resolves.toBeUndefined();
  });

  test("notifications that arrive while the app is open are shown", async () => {
    expect(await showNotification()).toMatchObject({ shouldShowBanner: true, shouldShowList: true });
  });

});
