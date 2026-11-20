import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";

const CHANNEL_ID = "arrival";

/** `data.type` of the arrival notification, read when it's tapped. */
export const ARRIVAL_NOTIFICATION = "arrival";

// The arrival notification is only sent while the app is in the background;
// in the foreground the on-route screen asks with a modal instead.
/** How notifications show while the app is open. */
export const showNotification = async () => ({
  shouldShowBanner: true,
  shouldShowList: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
});

Notifications.setNotificationHandler({ handleNotification: showNotification });

/**
 * Android 13+ only shows the permission prompt once a channel exists.
 * Never throws: without notifications, arrival is still asked in the app.
 */
export async function prepareNotifications() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Ankunft am Ziel",
        importance: AndroidImportance.HIGH,
      });
    }
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function notifyArrival(tourId: string, destinationAddress: string) {
  // Best effort: the modal still asks once the app is opened.
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ziel erreicht?",
      body: `${destinationAddress} – tippen, um die Tour abzuschließen.`,
      data: { type: ARRIVAL_NOTIFICATION, tourId },
    },
    // Right away; on Android through the arrival channel.
    trigger: Platform.OS === "android" ? { channelId: CHANNEL_ID } : null,
  }).catch(() => undefined);
}
