import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import LeftChevron from "../../../components/LeftChevron";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blockUser, getUserActiveItems, getUserInfo } from "../../../api";
import { User } from "../../../../shared/types";
import { FlashList } from "@shopify/flash-list";
import RefreshScreen from "../../../components/RefreshScreen";
import { ItemListing } from "../../../components/ItemListing";
import { VerifiedIcon } from "../../../components/VerifiedIcon";
import { OptionIcon } from "../../../components/OptionIcon";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useSession } from "../../../hooks/useSession";
import Toast from "react-native-toast-message";

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
  const { session } = useSession();
  const queryClient = useQueryClient();
  const blockUserMutation = useMutation({
    mutationFn: (userId: string) => blockUser(session?.token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", "all"] });
      router.replace("/home");
    },
  });

  const { showActionSheetWithOptions } = useActionSheet();
  const onPress = () => {
    const options = ["Block", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            // Block
            Alert.alert("Block", "Are you sure you want to block this user?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Block",
                onPress: () => {
                  if (!session || session.is_guest) {
                    Toast.show({
                      type: "error",
                      text1: "You must be logged in to block",
                    });
                    return;
                  }
                  blockUserMutation.mutate(sellerId as string);
                },
                style: "destructive",
              },
            ]);
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  return (
    <>
      <SafeAreaView className="bg-bgLight dark:bg-blackPrimary" />
      <View className="bg-bgLight h-full dark:bg-blackPrimary">
        <View className="flex flex-row justify-between items-center">
          <Pressable onPress={router.back} className="p-3">
            <LeftChevron />
          </Pressable>
          <Pressable onPress={onPress} className="p-3">
            <OptionIcon />
          </Pressable>
        </View>

        <ScrollView>
          <View className="flex items-start">
            {/* <View className="bg-blackPrimary w-full h-[80px]"></View> */}
            <Image
              source={{
                uri: user?.profile_image || "",
              }}
              className="w-16 h-16 rounded-full ml-2.5 bg-blackPrimary dark:bg-blackPrimary"
            />
          </View>

          <View className="flex-row mt-2 items-end justify-bottom justify-between px-2.5 pb-2">
            <View className="flex-col w-[200px]">
              <View className="flex flex-row mb-1 items-center max-w-[160px] h-[32px]">
                <Text className="mr-1 text-xl font-Poppins_500Medium text-left text-blackPrimary dark:text-bgLight">
                  {user?.name}
                </Text>
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
                  <Text className="font-Manrope_600SemiBold">
                    {user?.sales_done_count ?? 0}
                  </Text>{" "}
                  Sales Done
                </Text>
              </View>
            </View>
          </View>

          <View className="w-full h-2 bg-grayLight mt-2 dark:bg-zinc-950" />

          <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl text-blackPrimary dark:text-bgLight">
            Listed Items
            <Text className="font-Poppins_500Medium text-sm text-blackPrimary dark:text-bgLight">
              {" "}
              ({activeItems?.length ?? 0})
            </Text>
          </Text>

          <View className="bg-greyLight h-full dark:bg-blackPrimary">
            {isLoadingActiveItem ? (
              <></>
            ) : isErrorActiveItem ? (
              <RefreshScreen
                displayText="Something went wrong."
                refetch={refetch}
                // marginTop="30%"
              />
            ) : activeItems.length === 0 ? (
              <RefreshScreen
                displayText="User has no listed items"
                refetch={refetch}
                // marginTop="30%"
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
