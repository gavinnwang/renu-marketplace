import React, { useState } from "react";
import { Pressable, FlatList, Text, View, ScrollView } from "react-native";
import { useSession } from "../../../providers/ctx";
import Colors from "../../../constants/Colors";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../../../types/api";
import { ItemWithImage, UserWithCount } from "../../../types/types";
import { ItemListing } from "../../../components/ItemListing";
import { RefreshControl } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { User } from "@prisma/client";

export default function AccountScreen() {
  const { signOut, session } = useSession();
  console.log(session);
  const [user, setUser] = useState<UserWithCount | null>(null);

  const { isError: isErrorUser } = useQuery({
    queryFn: async () =>
      fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/users/me", {
        headers: {
          authorization: `Bearer ${session?.token}`,
        },
      }).then((x) => x.json()) as Promise<ApiResponse<UserWithCount>>,
    queryKey: ["me"],
    enabled: !!session && !!session.token,
    onSuccess: (data) => {
      if (data.status === "success") {
        setUser(data.data);
      } else {
        console.error(data);
      }
    },
  });

  const {
    data: savedItemData,
    isError: isErrorSavedItem,
    isLoading: isLoadingSavedItem,
  } = useQuery({
    queryFn: async () =>
      fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/saved/", {
        headers: {
          authorization: `Bearer ${session?.token}`,
        },
      }).then((x) => x.json()) as Promise<ApiResponse<ItemWithImage[]>>,
    queryKey: ["saved"],
    enabled: !!session && !!session.token,
    onSuccess(data) {
      console.log(data);
    },
  });

  // const {
  //   data: items,
  //   isLoading: isLoadingItems,
  //   isError: isErrorItems,
  //   refetch: refetchItems,
  // } = useQuery({
  //   queryFn: async () =>
  //     fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/items/").then((x) =>
  //       x.json()
  //     ) as Promise<ApiResponse<ItemWithImage[]>>,
  //   queryKey: ["item"],
  //   enabled: !!session,
  // });

  const [refreshing, _] = useState(false);

  return (
    <View className="bg-bgLight h-full">
      <View className="border-b border-grayMedium flex-row items-center  ">
        <Text className="m-2.5 my-4 font-Poppins_600SemiBold text-xl ">
          My Profile
        </Text>
        <DownArrowIcon />
      </View>
      <ScrollView>
        <View className="flex items-start">
          <View className="bg-blackPrimary w-full h-[80px]"></View>
          <Image
            source={{
              uri:
                user?.profile_image ||
                "../../../assets/images/placeholder-profile.webp",
            }}
            style={{
              borderColor: Colors.whitePrimary,
            }}
            className="w-[74px] h-[74px] rounded-full -mt-10 border ml-2.5 bg-blackPrimary"
          />
        </View>

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

          <View className="flex flex-col w-[100px] gap-y-0.5">
            <Pressable
              onPress={signOut}
              className="font-Manrope_400Regular bg-purplePrimary p-2"
            >
              <Text className="text-white text-center font-Manrope_600SemiBold">
                Edit
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full h-2 bg-grayLight mt-2" />

        <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl">
          Saved Items
          <Text className="font-Poppins_500Medium text-sm">
            {" "}
            ({savedItemData?.data?.length ?? 0})
          </Text>
        </Text>

        <View className="bg-greyLight h-full">
          {isLoadingSavedItem ? (
            <></>
          ) : isErrorSavedItem || savedItemData.status === "fail" ? (
            <Text className="mx-auto my-[30%] font-Poppins_600SemiBold text-lg">
              Something went wrong...
            </Text>
          ) : savedItemData?.data?.length === 0 ? (
            <Text className="mx-auto my-[30%] font-Poppins_600SemiBold text-lg">
              No items found.
            </Text>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={savedItemData?.data}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "flex-start",
                marginTop: 12,
                paddingHorizontal: 10,
              }}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={ItemListing}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const DownArrowIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path
      d="M4.12774 7.32321L11 14.0222L17.8722 7.32321C17.995 7.20328 18.1598 7.13614 18.3315 7.13614C18.5031 7.13614 18.668 7.20328 18.7907 7.32321C18.8502 7.38146 18.8974 7.45099 18.9297 7.52773C18.9619 7.60446 18.9785 7.68686 18.9785 7.77009C18.9785 7.85332 18.9619 7.93572 18.9297 8.01245C18.8974 8.08918 18.8502 8.15871 18.7907 8.21696L11.4799 15.345C11.3515 15.4701 11.1793 15.5401 11 15.5401C10.8207 15.5401 10.6485 15.4701 10.5201 15.345L3.20924 8.21834C3.14936 8.16004 3.10178 8.09035 3.06928 8.01336C3.03679 7.93637 3.02005 7.85365 3.02005 7.77009C3.02005 7.68652 3.03679 7.60381 3.06928 7.52682C3.10178 7.44983 3.14936 7.38013 3.20924 7.32184C3.33202 7.20191 3.49685 7.13477 3.66849 7.13477C3.84012 7.13477 4.00495 7.20191 4.12774 7.32184V7.32321Z"
      fill="black"
    />
  </Svg>
);
