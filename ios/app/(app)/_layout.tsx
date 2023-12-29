import { Redirect, Stack } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import React from "react";
import * as Notifications from "expo-notifications";
import { postPushToken } from "../../../shared/api";

export default function AppLayout() {
  const { session } = useSession();
  const postPushTokenMutation = useMutation({
    mutationFn: async (pushToken: string) =>
      postPushToken(session!.token, pushToken),
    onSuccess: () => {
      console.debug("successfully posted push token");
    },
    onError: (error) => {
      console.error("error posting push token", error);
    },
  });
  React.useEffect(() => {
    const uploadTokenOnStartup = async () => {
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
