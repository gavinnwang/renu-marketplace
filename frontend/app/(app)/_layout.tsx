import { Redirect, Stack, } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import React from "react";
import * as Notifications from 'expo-notifications';

const queryClient = new QueryClient();

export default function AppLayout() {

  React.useEffect(() => {
    const subscription = Notifications.addPushTokenListener(({ data: newToken }) => {
      console.debug("new token", newToken);
    });  
    return () => subscription.remove();
  }, [])

  const { session } = useSession();
  if (!session) {
    console.debug("redirecting back to home to sign in");
    return <Redirect href="/" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </QueryClientProvider>
  );
}
