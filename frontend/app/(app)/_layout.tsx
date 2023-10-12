import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { useSession } from "../../providers/ctx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogoWithText } from "../../components/Logo";

const queryClient = new QueryClient();

export default function AppLayout() {
  const { isLoading, session } = useSession();
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (
    !session ||
    (session && !session.token) ||
    !session.name ||
    !session.email
  ) {
    console.log("redirecting back to home to sign in");
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/" />;
  }
  
  const param = useLocalSearchParams();
  console.log("param", param)
  // This layout can be deferred because it's not the root layout.
  return (
    <QueryClientProvider client={queryClient}>

      <View className="flex flex-row items-center px-2.5 bg-bgLight pb-2.5">
        <LogoWithText className="flex-grow" />
        <View className="flex justify-center bg-grayLight items-center rounded-md flex-grow ml-2.5">
          <TextInput placeholder="Search here" className="p-2 w-full" />
        </View>
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </QueryClientProvider>
  );
}
