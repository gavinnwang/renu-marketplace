import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, View, useColorScheme } from "react-native";
import { SessionProvider, useSession } from "../providers/ctx";
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
import * as SecureStore from "expo-secure-store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// type Session = {
//   token: string;
//   email: string;
//   name: string;
// };

// const getInitialSession = () => {
//   let token;
//   SecureStore.getItemAsync("token").then((t) => {
//     token = t;
//   });
//   let email;
//   SecureStore.getItemAsync("email").then((e) => {
//     email = e;
//   });
//   let name;
//   SecureStore.getItemAsync("name").then((n) => {
//     name = n;
//   });
//   if (token && email && name) {
//     return {
//       token: token as string,
//       email: email as string,
//       name: name as string,
//     } as Session;
//   }
//   return undefined;
// };

// async function save(key: string, value: string) {
//   await SecureStore.setItemAsync(key, value);
// }

// async function getValueFor(key: string) {
//   let result = await SecureStore.getItemAsync(key);
//   if (result) {
//     alert("🔐 Here's your value 🔐 \n" + result);
//   } else {
//     alert("No values stored under that key.");
//   }
// }

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

    const {setSession} = useSession();

  async function getToken() {
    const session = await SecureStore.getItemAsync("session");
    console.log("session", session);
    if (session) {
      setSession(JSON.parse(session));
    }
  }

  useEffect(() => {
    getToken();
  }, []);


  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView className="bg-bgLight" />
      <Slot />
    </ThemeProvider>
  );
}
