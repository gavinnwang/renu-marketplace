import React, { useState } from "react";
import { Pressable, FlatList, Text, View, ScrollView } from "react-native";
import { useSession } from "../../../providers/ctx";
import Colors from "../../../constants/Colors";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../../../types/api";
import { ItemWithImage } from "../../../types/types";
import { ItemListing } from "../../../components/ItemListing";
import { RefreshControl } from "react-native-gesture-handler";

export default function AccountScreen() {
  const { signOut, session } = useSession();

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/items/").then((x) =>
        x.json()
      ) as Promise<ApiResponse<ItemWithImage[]>>,
    queryKey: ["item"],
  });

  const [refreshing, _] = useState(false);

  return (
    <View className="bg-bgLight h-full">
      <View className="border-b border-grayMedium">
        <Text className="ml-2.5 my-4 font-Poppins_600SemiBold text-xl ">
          My Profile
        </Text>
      </View>
      <ScrollView>
        <View className="flex items-center">
          <Image
            source={{ uri: "https://i.imgur.com/Q7jy9MS.jpeg" }}
            className=" w-full h-[120px]"
          ></Image>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
            style={{
              borderColor: Colors.whitePrimary,
            }}
            className="w-[74px] h-[74px] rounded-full -mt-10 border "
          />
        </View>

        <View className="flex-row -mt-4 items-end justify-bottom justify-between px-2 pb-2">
          <View className="flex-col w-[100px] ">
            <Text className="font-Manrope_400Regular text-sm ">
              {" "}
              <Text className="font-Manrope_600SemiBold">43</Text> Followers
            </Text>
            <Text className="font-Manrope_400Regular text-sm">
              <Text className="font-Manrope_600SemiBold">8</Text> Sales Done
            </Text>
          </View>

          <Text className=" text-base font-Poppins_500Medium text-center max-w-[160px]">
            {session?.name}
          </Text>

          <View className="flex flex-col w-[100px] gap-y-0.5">
            <Pressable className="font-Manrope_400Regular bg-purplePrimary p-2">
              <Text className="text-white text-center font-Manrope_600SemiBold">
                Edit
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full h-2 bg-grayLight mt-2" />

        <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl">
          Saved Items
        </Text>

        <View className="bg-grayMedium h-full">
          {isLoadingItems ? (
            <Text>...</Text>
          ) : isErrorItems ? (
            <Text>Something went wrong</Text>
          ) : items.data.length === 0 ? (
            <Text>No items</Text>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    refetchItems();
                  }}
                />
              }
              scrollEnabled={false}
              data={items.data}
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
