import FontAwesome from "@expo/vector-icons/FontAwesome";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { Text, View, useColorScheme } from "react-native";
import { SessionProvider } from "../providers/sessionProvider";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
} from "@expo-google-fonts/manrope";
import { SecularOne_400Regular } from "@expo-google-fonts/secular-one";
import useRetrieveSession from "../hooks/useLoadSession";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useNotificationObserver from "../hooks/useNotificationObserver";
import Toast from "react-native-toast-message";

export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    SecularOne_400Regular,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <SessionProvider>
        <RootLayoutNav />
      </SessionProvider>
      <Toast config={toastConfig} />
    </>
  );
}
const toastConfig = {
  error: ({ text1 }: any) => (
    <View className="px-2 py-1 mx-3 mt-3 bg-red-500 rounded-md">
      <Text className="text-white">{text1}</Text>
    </View>
  ),
};


function RootLayoutNav() {
  // const colorScheme = useColorScheme();

  useRetrieveSession(queryClient);

  useNotificationObserver();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Slot />
      {/* </ThemeProvider> */}
    </QueryClientProvider>
  );
}
