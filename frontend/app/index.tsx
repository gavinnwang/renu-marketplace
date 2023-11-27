import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSession } from "../hooks/useSession";
import { router } from "expo-router";
import { useEffect } from "react";
import { Circle, Path, Svg } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";

const BigLogo = () => (
  <Svg width="56" height="55" viewBox="0 0 56 55" fill="none">
    <Circle cx="27.1991" cy="27.1991" r="27.1991" fill="black" />
    <Path
      d="M20.2448 18.198C20.9486 19.1681 20.7099 20.5121 19.9076 21.4023C16.6992 24.9622 16.3111 30.4153 19.2556 34.474C22.6321 39.1283 29.1293 40.1885 33.7607 36.8285C38.3922 33.4685 39.4053 26.9695 36.0242 22.3089L34.0476 23.7428C33.2196 24.3435 32.0765 23.6534 32.2224 22.6409L33.4286 14.2696C33.5216 13.6238 34.1299 13.1825 34.7728 13.2945L43.105 14.7459C44.1128 14.9214 44.4141 16.2222 43.5861 16.8229L41.6095 18.2569C47.2401 26.0182 45.551 36.8535 37.8382 42.449C30.1254 48.0444 19.3009 46.2874 13.6702 38.526C9.00533 32.0959 9.36467 23.5557 14.0112 17.6334C15.6387 15.5591 18.6966 16.064 20.2448 18.198Z"
      fill="white"
    />
  </Svg>
);
export default function Index() {
  const { session, signIn } = useSession();
  useEffect(() => {
    if (session) {
      router.replace(`/home`);
    }
  }, [session]);

  return (
    <SafeAreaView className="flex h-full w-full pt-4 items-center bg-bgLight flex-col justify-between">
      <View className="flex flex-row items-center mt-[30%]">
        <BigLogo />
        <Text className="pl-1 text-black font-Poppins_600SemiBold text-[45px] tracking-tighter">
          Renu
        </Text>
      </View>
      <Text className="mt-1 font-Poppins_600SemiBold text-black text-base w-[300px] mx-auto text-center leading-6">
        Shop and sell with ease within people in your college area!
      </Text>

      <TouchableOpacity onPress={signIn}>
        <View className="mt-[40%] h-[45px] rounded-sm border w-[80vw] flex justify-center">
          <Text className="mx-auto font-Poppins_600SemiBold text-base">
            Login with Google
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
