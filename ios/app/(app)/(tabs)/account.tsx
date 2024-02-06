import React from "react";
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { useSession } from "../../../hooks/useSession";
import { deleteUser, getUserMeInfo } from "../../../api";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { VerifiedIcon } from "../../../components/VerifiedIcon";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

export default function AccountScreen() {
  const { signOut, session } = useSession();
  // console.debug(session);

  const {
    data: user,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => getUserMeInfo(session!.token!),
    enabled: !!session && !!session.token && !session.is_guest,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleEmailLink = () => {
    const email = "gavinwang313@gmail.com";
    const subject = encodeURIComponent("[Renu Feedback]");
    const url = `mailto:${email}?subject=${subject}`;
    Linking.openURL(url).catch((errMsg) =>
      Toast.show({
        type: "error",
        text1: `An error occured: ${errMsg}`,
      })
    );
  };

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: `An error occured: ${error}`,
      });
    },
    onSettled: async () => {
      setSession(null);
      queryClient.removeQueries();
      await SecureStore.deleteItemAsync("session");
      await SecureStore.deleteItemAsync("searchHistory");
      router.replace("/");
    },
  });

  const { setSession } = useSession();
  const queryClient = useQueryClient();

  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <View className="flex-row items-center">
        <Text className="m-2.5 mt-2 font-Poppins_600SemiBold text-xl text-blackPrimary dark:text-bgLight">
          My Profile
        </Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              if (!session?.token) {
                setTimeout(() => {
                  setRefreshing(false);
                }, 50);
                return;
              }
              await refetch();
              setRefreshing(false);
            }}
          />
        }
        className="bg-bgLight dark:bg-blackPrimary"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View className="flex flex-row items-start">
          <Image
            source={{
              uri: user?.profile_image ?? "",
            }}
            className="w-16 h-16 rounded-full border-white ml-2.5 bg-blackPrimary"
          />
          <View className="flex-row mt-2 items-end justify-bottom justify-between px-2.5 pb-2">
            <View className="flex-col w-[300px]">
              <View className="flex flex-row mb-1 items-center max-w-[350px] h-[32px]">
                {!user || session?.is_guest ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSession(null);
                      router.replace("/login");
                    }}
                  >
                    <Text className="mr-1 text-base font-Poppins_500Medium text-left text-blackPrimary dark:text-bgLight">
                      Log in to view profile
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="mr-1 text-xl font-Poppins_500Medium text-left text-blackPrimary dark:text-bgLight">
                    {user.name}
                  </Text>
                )}
                {user?.verified && <VerifiedIcon />}
              </View>

              <View className="flex-row">
                <Text className="font-Manrope_400Regular text-sm mr-3 text-blackPrimary dark:text-bgLight">
                  <Text className="font-Manrope_600SemiBold text-blackPrimary dark:text-bgLight">
                    {user?.active_listing_count ?? 0}
                  </Text>{" "}
                  Active Listings
                </Text>
                <Text className="font-Manrope_400Regular text-sm text-blackPrimary dark:text-bgLight">
                  <Text className="font-Manrope_600SemiBold text-blackPrimary dark:text-bgLight">
                    {user?.sales_done_count ?? 0}
                  </Text>{" "}
                  Sales Done
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full h-2 bg-grayLight dark:bg-zinc-950 mt-2" />
        <TouchableOpacity
          className="ml-2 mt-2.5 mb-1 flex flex-row items-center"
          onPress={() => router.push("/saved")}
        >
          {/* <HeartIcon /> */}
          <Text className="ml-2 font-Manrope_500Medium text-base text-blackPrimary dark:text-bgLight">
            Saved items
          </Text>
        </TouchableOpacity>

        <View className="w-full h-2 bg-grayLight dark:bg-zinc-950 mt-2" />
        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={handleEmailLink}
        >
          {/* <EmailIcon /> */}
          <Text className=" font-Manrope_500Medium text-base text-blackPrimary dark:text-bgLight">
            Share feedbacks
          </Text>
        </TouchableOpacity>
        <View className="w-full h-2 bg-grayLight dark:bg-zinc-950 mt-2" />

        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={() => {
            if (!session || session?.is_guest) {
              Toast.show({
                type: "error",
                text1: "You must be logged in to delete your account",
              });
              return;
            }
            Alert.alert(
              "Confirm",
              "Are you sure you want to delete your account? This action is irreversible.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    const token = session.token;
                    await deleteUserMutation.mutateAsync(token);
                  },
                },
              ]
            );
          }}
        >
          <Text className="font-Manrope_500Medium text-base text-red-500">
            Delete account
          </Text>
        </TouchableOpacity>

        <View className="w-full h-2 bg-grayLight dark:bg-zinc-950 mt-2" />

        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={() => {
            if (!session || session?.is_guest) {
              setSession(null);
              router.replace("/login");
              return;
            }
            Alert.alert("Confirm", "Are you sure you want to sign out?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Sign out",
                style: "destructive",
                onPress: () => {
                  setSession(null);
                  queryClient.removeQueries();
                  SecureStore.deleteItemAsync("session");
                  router.replace("/");
                },
              },
            ]);
          }}
        >
          <Text
            className={`font-Manrope_500Medium text-base ${
              session?.is_guest ? "text-blackPrimary dark:text-bgLight" : "text-red-500"
            }`}
          >
            {session?.is_guest ? "Log in" : "Sign out"}
          </Text>
        </TouchableOpacity>
        <View className="w-full h-[500%] bg-grayLight dark:bg-zinc-950 mt-2" />
      </ScrollView>
    </View>
  );
}

const EmailIcon = () => {
  const colorScheme = useColorScheme();
  return (
    <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-5 h-5">
      <Path
        stroke={colorScheme === "dark" ? "white" : "black"}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
      />
    </Svg>
  );
};

const HeartIcon = () => {
  const colorScheme = useColorScheme();
  return (
    <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-5 h-5">
      <Path
        stroke={colorScheme === "dark" ? "white" : "black"}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </Svg>
  );
};
