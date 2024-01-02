import React from "react";
import { Text, View, ScrollView, RefreshControl, Alert } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { useSession } from "../../../hooks/useSession";
import { getUserMeInfo } from "../../../api";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { router } from "expo-router";

export default function AccountScreen() {
  const { signOut, session } = useSession();
  // console.debug(session);

  const {
    data: user,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => getUserMeInfo(session!.token),
    enabled: !!session && !!session.token,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleEmailLink = () => {
    const email = "gavinwang313@gmail.com";
    const subject = encodeURIComponent("[Renu Feedback]");
    const url = `mailto:${email}?subject=${subject}`;
    Linking.openURL(url).catch((err) => console.error(err));
  };

  return (
    <View className="bg-bgLight h-full">
      <View className="flex-row items-center">
        <Text className="m-2.5 mt-2 font-Poppins_600SemiBold text-xl ">
          My Profile
        </Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
          />
        }
        className="bg-bgLight"
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
            <View className="flex-col w-[200px]">
              <Text className="text-xl mb-1 font-Poppins_500Medium text-left max-w-[160px] h-[30px]">
                {user?.name ?? session?.name}
              </Text>

              <View className="flex-row">
                <Text className="font-Manrope_400Regular text-sm mr-3">
                  <Text className="font-Manrope_600SemiBold">
                    {user?.active_listing_count ?? 0}
                  </Text>{" "}
                  Active Listings
                </Text>
                <Text className="font-Manrope_400Regular text-sm">
                  <Text className="font-Manrope_600SemiBold">
                    {user?.sales_done_count ?? 0}
                  </Text>{" "}
                  Sales Done
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full h-2 bg-grayLight mt-2" />
        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={() => router.push("/saved")}
        >
          <HeartIcon />
          <Text className="ml-2 font-Manrope_500Medium text-base">
            Saved items
          </Text>
        </TouchableOpacity>

        <View className="w-full h-2 bg-grayLight mt-2" />
        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={handleEmailLink}
        >
          <EmailIcon />
          <Text className="ml-2 font-Manrope_500Medium text-base">
            Share feedbacks
          </Text>
        </TouchableOpacity>

        <View className="w-full h-2 bg-grayLight mt-2" />

        <TouchableOpacity
          className="ml-4 mt-2.5 mb-1 flex flex-row items-center"
          onPress={signOut}
        >
          <Text className="font-Manrope_500Medium text-base text-red-500">
            Sign out
          </Text>
        </TouchableOpacity>
        <View className="w-full h-[500%] bg-grayLight mt-2" />
      </ScrollView>
    </View>
  );
}

const EmailIcon = () => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="black"
    className="w-5 h-5"
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  </Svg>
);

const HeartIcon = () => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="black"
    className="w-5 h-5"
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </Svg>
);
