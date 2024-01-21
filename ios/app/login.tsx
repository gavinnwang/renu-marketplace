import { SafeAreaView, Text, View } from "react-native";
import { useSession } from "../hooks/useSession";
import { router } from "expo-router";
import { useEffect } from "react";
import { G, Path, Svg } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BigLogo } from "../components/Logo";
import * as AppleAuthentication from "expo-apple-authentication";
import Toast from "react-native-toast-message";
import { useMutation } from "@tanstack/react-query";
import { postAppleLogin } from "../api";
import { AppleAuthResponse } from "../../shared/types";
import * as SecureStore from "expo-secure-store";

const GoogleLogo = ({ className }: { className?: string }) => (
  <Svg viewBox="0 0 48 48" width="16" height="16" className={className}>
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
  const { signInWithGoogle, session, setSession } = useSession();

  useEffect(() => {
    if (session) {
      console.debug("Session found, redirecting to home");
      router.replace(`/`);
    }
  }, [session]);
  type useMutationRequest = {
    identityToken: string;
    username?: string;
  };
  const postAppleLoginMutation = useMutation(
    ({ identityToken, username }: useMutationRequest) => {
      return postAppleLogin(identityToken, username);
    },
    {
      onSuccess: (res: AppleAuthResponse) => {
        if (res.token && res.email && res.user_id) {
          const s = {
            token: res.token,
            email: res.email,
            user_id: res.user_id,
          };
          setSession(s);
          SecureStore.setItemAsync("session", JSON.stringify(s));
        } else {
          router.replace("/");
        }
        console.debug("successfully posted apple login");
      },
      onError: (error: any) => {
        console.error("error posting apple login", error);
      },
    }
  );

  return (
    <SafeAreaView className="flex h-full w-full pt-4 items-center bg-bgLight flex-col justify-between dark:bg-blackPrimary">
      <View className="flex flex-row items-center mt-[30%]">
        <BigLogo />
        <Text className="pl-1 text-blackPrimary font-Poppins_600SemiBold text-[45px] tracking-tighter dark:text-white">
          Renu
        </Text>
      </View>
      <Text className="mt-1 font-Poppins_600SemiBold dark:text-white  text-base w-[300px] mx-auto text-center leading-6">
        Shop and sell with people within your college area with ease!
      </Text>

      <View>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{
            height: 45,
          }}
          onPress={async () => {
            try {
              const credential: AppleAuthentication.AppleAuthenticationCredential =
                await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
              if (credential.identityToken) {
                console.log(credential);
                postAppleLoginMutation.mutate({
                  identityToken: credential.identityToken,
                  username: credential.fullName?.givenName ?? undefined,
                });
              }
            } catch (error: any) {
              if (error.code === "ERR_CANCELED") {
                Toast.show({
                  type: "error",
                  text1: "Apple login cancelled",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1:
                    error.message ?? "An error occured while authenticating",
                });
              }
            }
          }}
        />
        <TouchableOpacity onPress={signInWithGoogle} className="mb-12 mt-4">
          <View className="items-center flex-row h-[45px] border-[1.5px] rounded-md w-[80vw] flex justify-center dark:border-white">
            <GoogleLogo />
            <Text className="ml-2 font-Poppins_600SemiBold text-base dark:text-white">
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
