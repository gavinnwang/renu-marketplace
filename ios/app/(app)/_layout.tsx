import { Redirect, Stack } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import React from "react";
import * as Notifications from "expo-notifications";
import { postPushToken } from "../../api";
import Toast from "react-native-toast-message";

export default function AppLayout() {
  const { session } = useSession();
  const postPushTokenMutation = useMutation({
    mutationFn: async (pushToken: string) => () => {
      if (!session || !session.token) {
        console.debug("no session found, not posting push token");
        Toast.show({
          type: "error",
          text1: "No session found, not posting push token",
        });
        return;
      }
      postPushToken(session!.token, pushToken);
    },
    onSuccess: () => {
      console.debug("successfully posted push token");
    },
    onError: (error) => {
      console.error("error posting push token", error);
    },
  });
  React.useEffect(() => {
    const uploadTokenOnStartup = async () => {
      if (!session || session.is_guest) {
        console.debug("not posting because session is guest or not found");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.debug("UPLOADING TOKEN", token);
      postPushTokenMutation.mutateAsync(token);
    };
    uploadTokenOnStartup();
  }, []);

  if (!session) {
    console.debug("redirecting back to home to sign in");
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
