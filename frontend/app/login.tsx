import { SafeAreaView, Text, View } from "react-native";
import { useSession } from "../hooks/useSession";
import { router } from "expo-router";
import { useEffect } from "react";
import { G, Path, Svg } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BigLogo } from "../components/Logo";

const GoogleLogo = ({ className }: { className?: string }) => (
  <Svg viewBox="0 0 48 48" width="28" height="28" className={className}>
    <G>
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <Path fill="none" d="M0 0h48v48H0z" />
    </G>
  </Svg>
);
export default function LoginPage() {
  const { signIn, session } = useSession();

  useEffect(() => {
    if (session) {
      console.debug("Session found, redirecting to home");
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
        Shop and sell with people within your college area with ease!
      </Text>

      <TouchableOpacity onPress={signIn} className="mb-12">
        <View className="items-center flex-row h-[45px] rounded-sm border-[1.5px] w-[80vw] flex justify-center">
          <GoogleLogo />
          <Text className="ml-2 font-Poppins_600SemiBold text-base">
            Continue with Google
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
