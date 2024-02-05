import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LeftChevron from "../../components/LeftChevron";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import { getSavedItems } from "../../api";
import RefreshScreen from "../../components/RefreshScreen";
import { FlashList } from "@shopify/flash-list";
import { ItemListing } from "../../components/ItemListing";
import React from "react";
import { router } from "expo-router";

export default function SavedItemsPage() {
  const { session, setSession } = useSession();
  const {
    data: savedItemData,
    isError: isErrorSavedItem,
    isLoading: isLoadingSavedItem,
    refetch,
  } = useQuery({
    queryKey: ["savedItems"],
    queryFn: () => getSavedItems(session!.token!),
    enabled: !!session && !!session.token && !session.is_guest,
  });
  const [refreshing, setRefreshing] = React.useState(false);
  return (
    <>
      <SafeAreaView className="bg-bgLight dark:bg-blackPrimary" />
      <View className="bg-bgLight dark:bg-blackPrimary h-full">
        <View className="flex flex-row items-center">
          <Pressable onPress={router.back} className="p-3">
            <LeftChevron />
          </Pressable>
          <Text className=" font-Poppins_600SemiBold text-xl text-blackPrimary dark:text-bgLight">
            Saved items
            <Text className="font-Poppins_500Medium text-sm text-blackPrimary dark:text-bgLight">
              {" "}
              ({savedItemData?.length ?? 0})
            </Text>{" "}
          </Text>
        </View>

        {session?.is_guest ? (
          <View className="bg-greyLight">
            <View className="h-[80%] flex-grow mx-5">
              <View className="flex-grow flex flex-col justify-center items-center w-full">
                <Text className="font-Poppins_600SemiBold text-base text-center text-blackPrimary dark:text-bgLight">
                  You must be logged in to view your saved items.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSession(null);
                    router.replace("/login");
                  }}
                  className="border-[1.5px] border-blackPrimary dark:border-bgLight mt-4 h-[40px] w-[160px] mx-auto flex items-center justify-center rounded-sm"
                >
                  <Text className="font-Poppins_600SemiBold text-blackPrimary dark:text-bgLight">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : isLoadingSavedItem ? (
          <></>
        ) : isErrorSavedItem ? (
          <View className="bg-greyLight">
            <View className="h-[80%] flex-grow">
              <RefreshScreen
                displayText="Something went wrong."
                refetch={refetch}
              />
            </View>
          </View>
        ) : savedItemData.length === 0 ? (
          <View className="bg-greyLight">
            <View className="h-[80%] flex-grow">
              <RefreshScreen
                displayText="You have no saved items."
                refetch={refetch}
              />
            </View>
          </View>
        ) : (
          <View className="bg-greyLight h-full">
            <FlashList
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
              showsVerticalScrollIndicator={false}
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
          </View>
        )}
      </View>
    </>
  );
}
