import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import LeftChevron from "../../../components/LeftChevron";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../../../api";
import { User } from "../../../types";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { FlashList } from "@shopify/flash-list";
import RefreshScreen from "../../../components/RefreshScreen";

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
    data: savedItemData,
    isError: isErrorSavedItem,
    isLoading: isLoadingSavedItem,
    refetch,
  } = useQuery({
    queryKey: ["user_items", sellerId],
    queryFn: () => getUserInfo(sellerId as string),
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

            {/* <View className="flex flex-col w-[100px] gap-y-0.5">
              <TouchableOpacity
                onPress={signOut}
                className="font-Manrope_400Regular bg-purplePrimary p-2 rounded-sm"
              >
                <Text className="text-white text-center font-SecularOne_400Regular">
                  SIGN OUT
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>

          <View className="w-full h-2 bg-grayLight mt-2" />

          <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl">
            Listed Items
            <Text className="font-Poppins_500Medium text-sm">
              {" "}
              ({items?.length ?? 0})
            </Text>
          </Text>

          <View className="bg-greyLight h-full">
            {isLoadingSavedItem ? (
              <></>
            ) : isErrorSavedItem ? (
              <RefreshScreen
                displayText="Something went wrong."
                refetch={refetch}
                marginTop="30%"
              />
            ) : savedItemData.length === 0 ? (
              <RefreshScreen
                displayText="You have no saved items."
                refetch={refetch}
                marginTop="30%"
              />
            ) : (
              <FlashList
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                data={savedItemData}
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
