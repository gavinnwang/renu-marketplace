import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
  } else {
    console.log("already granted");
    return;
  }
}
