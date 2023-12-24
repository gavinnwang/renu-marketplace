import { Redirect, Stack, } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";

const queryClient = new QueryClient();

export default function AppLayout() {

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
