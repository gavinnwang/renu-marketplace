import { SafeAreaView, Text, View } from "react-native";
import { useSession } from "../hooks/useSession";
import { router } from "expo-router";
import { useEffect } from "react";
import { BigLogo } from "../components/Logo";
import { SafeAreaViewBetter } from "../components/SafeAreaViewBetter";

export default function Index() {
  const { session, loadedFromStorage } = useSession();
  useEffect(() => {
    if (!loadedFromStorage) {
      console.debug("Not loaded from storage, waiting for session to load");
      return;
    }
    if (session) {
      console.debug("Session found, redirecting to home");
      router.replace(`/home`);
    } else {
      console.debug("No session found, redirecting to login");
      router.replace("/login");
    }
  }, [session, loadedFromStorage]);

  return (
    <SafeAreaViewBetter>
      <View className="flex h-full w-full flex-grow items-center justify-center bg-bgLight dark:bg-blackPrimary">
        <View className="flex flex-row items-center">
          <BigLogo />
          <Text className="pl-1 text-blackPrimary font-Poppins_600SemiBold text-[45px] tracking-tighter dark:text-white">
            Renu
          </Text>
        </View>
      </View>
    </SafeAreaViewBetter>
  );
}
