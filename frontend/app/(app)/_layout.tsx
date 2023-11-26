import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import { getUserMeInfo } from "../../api";

const queryClient = new QueryClient();

export default function AppLayout() {
  const { isLoading, session } = useSession();
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

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
