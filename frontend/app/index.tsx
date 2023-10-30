import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSession } from "../providers/ctx";
import { router } from "expo-router";
import { LogoWithText } from "../components/Logo";
import { useEffect } from "react";
import { SECTIONS } from "./(app)/(tabs)/home/[section]";

export default function Index() {
  const {  session, signIn } = useSession();
  useEffect(() => {
    if (session) {
      router.replace(`/home/${SECTIONS[0].value}`);
    }
  }, [session]);
  return (
    <SafeAreaView className="flex h-full w-full pt-4 items-center bg-bgLight">
      <View>
        <LogoWithText />
        <Pressable
          className="bg-grayLight p-3 rounded-md px-8 mt-4"
          onPress={() => signIn("/welcome")}
        >
          <Text className="text-xl">Sign In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
