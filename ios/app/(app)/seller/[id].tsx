import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import LeftChevron from "../../../components/LeftChevron";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { getUserActiveItems, getUserInfo } from "../../../../shared/api";
import { User } from "../../../../shared/types";
import { FlashList } from "@shopify/flash-list";
import RefreshScreen from "../../../components/RefreshScreen";
import { ItemListing } from "../../../components/ItemListing";

export default function SellerPage() {
  const { sellerString, sellerId } = useLocalSearchParams();
  const { data: user, isError } = useQuery({
    queryKey: ["user", sellerId],
    queryFn: () => getUserInfo(sellerId as string),
    enabled: !!sellerId && !sellerString,
    initialData: () => {
      if (sellerString) {
        return JSON.parse(sellerString as string) as User;
      } else {
        return undefined;
      }
    },
  });

  const {
    data: activeItems,
    isError: isErrorActiveItem,
    isLoading: isLoadingActiveItem,
    refetch,
  } = useQuery({
    queryKey: ["user_items", sellerId],
    queryFn: () => getUserActiveItems(sellerId as string),
    enabled: !!sellerId,
  });

  return (
    <>
      <SafeAreaView className="bg-bgLight" />
      <View className="bg-bgLight h-full">
        <Pressable onPress={router.back} className="p-3">
          <LeftChevron />
        </Pressable>

        <ScrollView>
          <View className="flex items-start">
            <View className="bg-blackPrimary w-full h-[80px]"></View>
            <Image
              source={{
                uri:
                  user?.profile_image || ""
              }}
              className="w-[74px] h-[74px] rounded-full -mt-10 border border-white ml-2.5 bg-blackPrimary"
            />
          </View>

          <View className="flex-row mt-2 items-end justify-bottom justify-between px-2.5 pb-2">
            <View className="flex-col w-[200px]">
              <Text className="text-xl mb-1 font-Poppins_500Medium text-left max-w-[160px] h-[30px]">
                {user?.name}
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

          <View className="w-full h-2 bg-grayLight mt-2" />

          <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl">
            Listed Items
            <Text className="font-Poppins_500Medium text-sm">
              {" "}
              ({activeItems?.length ?? 0})
            </Text>
          </Text>

          <View className="bg-greyLight h-full">
            {isLoadingActiveItem ? (
              <></>
            ) : isErrorActiveItem ? (
              <RefreshScreen
                displayText="Something went wrong."
                refetch={refetch}
                marginTop="30%"
              />
            ) : activeItems.length === 0 ? (
              <RefreshScreen
                displayText="You have no Active items."
                refetch={refetch}
                marginTop="30%"
              />
            ) : (
              <FlashList
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                data={activeItems}
                numColumns={2}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingLeft: 10,
                }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={ItemListing}
                estimatedItemSize={320}
                removeClippedSubviews={true}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
