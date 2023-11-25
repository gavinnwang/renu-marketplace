import { router, useLocalSearchParams } from "expo-router";
import {
  Text,
  Pressable,
  SafeAreaView,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useQuery } from "@tanstack/react-query";
import Colors from "../../../constants/Colors";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";
import PaginationDots from "../../../components/PaginationDots";
import { useRef, useState } from "react";
import { CATEGORIES } from "../(tabs)/home";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "../../../hooks/useSession";
import { getChatIdFromItemId, getItem, getUserInfo } from "../../../api";
dayjs.extend(relativeTime);

const CloseIcon = () => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke={Colors.grayPrimary}
    className="w-6 h-6"
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      d="M6 18L18 6M6 6l12 12"
    />
  </Svg>
);

export default function ItemPage() {
  const param = useLocalSearchParams();
  const itemId = param.id;
  const { session } = useSession();

  const { data: item, isError } = useQuery({
    queryFn: () => getItem(itemId as string),
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });

  const { data: chatId, isError: isErrorChatId } = useQuery({
    queryFn: () => getChatIdFromItemId(session!.token, itemId as string),
    queryKey: ["chat_item", itemId],
    enabled: !!session && !!itemId,
  });

  const { data: seller } = useQuery({
    queryFn: () => getUserInfo(item!.user_id),
    queryKey: ["user", item?.user_id],
    enabled: !!item && !!item.user_id,
  });

  const [index, setIndex] = useState(0);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    setIndex(viewableItems[0].index);
  }).current;

  return (
    <>
      <SafeAreaView className="bg-bgLight" />
      <View className="bg-bgLight h-full">
        <Pressable onPress={router.back} className="p-3">
          <CloseIcon />
        </Pressable>

        {item ? (
          <ScrollView>
            <FlatList
              data={item.images}
              renderItem={({ item }) => (
                <Image
                  transition={{
                    effect: "cross-dissolve",
                    duration: 300,
                  }}
                  placeholder={"TCLqY200RSDlM{_24o4n-:~p?b9F"}
                  style={{
                    height: "100%",
                    width: Dimensions.get("window").width,
                  }}
                  source={{
                    uri: item,
                  }}
                />
              )}
              showsHorizontalScrollIndicator={false}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
              style={{
                height: Dimensions.get("window").width,
              }}
            />
            <View className="relative">
              {item.images.length > 1 && (
                <PaginationDots data={item.images} currentIndex={index} />
              )}
            </View>
            {item.user_id === session?.user_id ? (
              <View className="px-3 py-1.5 w-full bg-purplePrimary flex justify-center">
                <Text className="font-Manrope_500Medium text-white">
                  {item.status === "inactive"
                    ? `You sold this item ${dayjs(item.updated_at).fromNow()}`
                    : `You listed this item ${dayjs(
                        item.updated_at
                      ).fromNow()}`}
                  .
                </Text>
              </View>
            ) : (
              item.status === "inactive" && (
                <View className="px-3 py-1.5 w-full bg-purplePrimary flex justify-center">
                  <Text className="font-Manrope_500Medium text-white">
                    This item is mark as sold.
                  </Text>
                </View>
              )
            )}
            <View className="w-full flex flex-col p-3 py-3">
              <Text className="text-lg font-Poppins_600SemiBold">
                {item.name}
              </Text>
              <View className="flex flex-row items-center">
                <CategoryIcon />
                <Text className="mx-1.5 font-Manrope_400Regular text-sm">
                  Category
                </Text>
                <Text className="font-Manrope_600SemiBold text-sm">
                  {CATEGORIES[item.category]}
                </Text>
              </View>
              <Text className="text-[26px] text-purplePrimary font-Manrope_600SemiBold">
                ${item.price}
              </Text>
            </View>
            <View className="h-2 bg-grayLight" />
            <View className="p-3 flex flex-col gap-y-2">
              <View className="flex flex-row gap-x-0.5">
                <Text className="text-base font-Poppins_600SemiBold">
                  Description
                </Text>
              </View>

              <View>
                <Text className="font-Manrope_400Regular text-sm mb-1">
                  {item.description ?? "No description provided."}
                </Text>
              </View>
              <Text className="font-Manrope_400Regular text-xs">
                {item.updated_at !== item.created_at && item.status === "active"
                  ? `Re-listed ${dayjs(
                      item.updated_at
                    ).fromNow()}. First listed ${dayjs(
                      item.created_at
                    ).fromNow()}`
                  : `Listed ${dayjs(item.created_at).fromNow()}`}
              </Text>
            </View>

            <View className="h-2 bg-grayLight" />

            <View className="p-3 flex flex-col gap-y-2">
              <Text className="font-Poppins_600SemiBold text-base">Seller</Text>
              <Pressable
                onPress={() => {
                  console.log("seller", item.user_id);
                  if (seller?.id === session?.user_id) {
                    router.push("/account");
                  } else {
                    router.push(`/seller/${seller?.id}`);
                  }
                }}
                className="flex flex-row items-center"
              >
                <Image
                  transition={{
                    effect: "cross-dissolve",
                    duration: 250,
                  }}
                  placeholder={"TCLqY200RSDlM{_24o4n-:~p?b9F"}
                  source={{
                    uri: seller?.name,
                  }}
                  style={{
                    borderColor: Colors.whitePrimary,
                  }}
                  className="w-[53px] h-[53px] rounded-full bg-blackPrimary"
                />
                <View className="flex flex-col gap-y-1 ml-2">
                  <Text className="font-Poppins_500Medium text-base text-blackPrimary">
                    {seller?.name ?? "Loading user"}
                  </Text>
                  <View className="flex flex-row gap-x-1">
                    <Text className="font-Manrope_400Regular text-sm">
                      {seller?.active_listing_count ?? 0} listings
                    </Text>
                    <Text className="font-Manrope_400Regular text-sm">
                      {seller?.sales_done_count ?? 0} sold
                    </Text>
                  </View>
                </View>

                <View className="ml-auto flex flex-col w-[100px] gap-y-0.5">
                  <Pressable
                    onPress={() => {
                      if (item.user_id === session?.user_id) {
                        router.push("/account");
                      } else if (seller) {
                        if (chatId) {
                          router.push({
                            pathname: `/chat/${item.id}`,
                            params: {
                              chatIdParam: chatId?.toString(),
                              sellOrBuy: "Buy",
                              newChat: "false",
                              otherUserName: seller.name,
                            },
                          });
                        } else {
                          router.push({
                            pathname: `/chat/${item.id}`,
                            params: {
                              sellOrBuy: "Buy",
                              newChat: "true",
                              otherUserName: seller.name,
                            },
                          });
                        }
                      }
                    }}
                    className="font-Manrope_400Regular bg-purplePrimary p-2"
                  >
                    <Text className="text-white text-center font-Manrope_600SemiBold">
                      {item.user_id === session?.user_id ? "Edit" : "Message"}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </View>
            <View className="h-16" />
          </ScrollView>
        ) : (
          <>
            {/* <Text className="font-Poppins_500Medium text-base mx-auto">
              Loading
            </Text> */}
          </>
        )}
      </View>
    </>
  );
}

const CategoryIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 12 12" fill="none">
    <Path
      d="M4.875 10.125H2.625C2.42609 10.125 2.23532 10.046 2.09467 9.90533C1.95402 9.76468 1.875 9.57391 1.875 9.375V7.125C1.875 6.92609 1.95402 6.73532 2.09467 6.59467C2.23532 6.45402 2.42609 6.375 2.625 6.375H4.875C5.07391 6.375 5.26468 6.45402 5.40533 6.59467C5.54598 6.73532 5.625 6.92609 5.625 7.125V9.375C5.625 9.57391 5.54598 9.76468 5.40533 9.90533C5.26468 10.046 5.07391 10.125 4.875 10.125ZM4.875 7.125H2.625V9.375H4.875V7.125ZM9.375 10.125H7.125C6.92609 10.125 6.73532 10.046 6.59467 9.90533C6.45402 9.76468 6.375 9.57391 6.375 9.375V7.125C6.375 6.92609 6.45402 6.73532 6.59467 6.59467C6.73532 6.45402 6.92609 6.375 7.125 6.375H9.375C9.57391 6.375 9.76468 6.45402 9.90533 6.59467C10.046 6.73532 10.125 6.92609 10.125 7.125V9.375C10.125 9.57391 10.046 9.76468 9.90533 9.90533C9.76468 10.046 9.57391 10.125 9.375 10.125ZM9.375 7.125H7.125V9.375H9.375V7.125ZM4.875 5.625H2.625C2.42609 5.625 2.23532 5.54598 2.09467 5.40533C1.95402 5.26468 1.875 5.07391 1.875 4.875V2.625C1.875 2.42609 1.95402 2.23532 2.09467 2.09467C2.23532 1.95402 2.42609 1.875 2.625 1.875H4.875C5.07391 1.875 5.26468 1.95402 5.40533 2.09467C5.54598 2.23532 5.625 2.42609 5.625 2.625V4.875C5.625 5.07391 5.54598 5.26468 5.40533 5.40533C5.26468 5.54598 5.07391 5.625 4.875 5.625ZM4.875 2.625H2.625V4.875H4.875V2.625ZM9.375 5.625H7.125C6.92609 5.625 6.73532 5.54598 6.59467 5.40533C6.45402 5.26468 6.375 5.07391 6.375 4.875V2.625C6.375 2.42609 6.45402 2.23532 6.59467 2.09467C6.73532 1.95402 6.92609 1.875 7.125 1.875H9.375C9.57391 1.875 9.76468 1.95402 9.90533 2.09467C10.046 2.23532 10.125 2.42609 10.125 2.625V4.875C10.125 5.07391 10.046 5.26468 9.90533 5.40533C9.76468 5.54598 9.57391 5.625 9.375 5.625ZM9.375 2.625H7.125V4.875H9.375V2.625Z"
      fill="black"
    />
  </Svg>
);
