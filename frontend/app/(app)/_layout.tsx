import { Redirect, Stack } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import React from "react";
import * as Notifications from "expo-notifications";
import { postPushToken } from "../../api";

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
    const subscription = Notifications.addPushTokenListener(
      ({ data: newToken }) => {
        console.debug("new token", newToken);
        console.debug("UPLOADING TOKEN")
        postPushTokenMutation.mutateAsync(newToken);
      }
    );
    return () => subscription.remove();
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
