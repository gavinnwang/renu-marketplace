import { router, useLocalSearchParams } from "expo-router";
import { Text, Pressable, SafeAreaView, View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useQuery } from "@tanstack/react-query";
import Colors from "../../../constants/Colors";
import { ApiResponse } from "../../../types/api";
import { Image } from "expo-image";
import { useSession } from "../../../providers/ctx";
import { ItemWithImage, UserWithCount } from "../../../types/types";
import { FlatList } from "react-native-gesture-handler";
import PaginationDots from "../../../components/PaginationDots";
import { useRef, useState } from "react";

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

  const { data: item } = useQuery({
    queryFn: async () =>
      fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/items/${itemId}`
      ).then((x) => x.json()) as Promise<ApiResponse<ItemWithImage>>,
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });

  const [seller, setSeller] = useState<UserWithCount>();

  useQuery({
    queryFn: async () =>
      fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${item?.data.user_id}`
      ).then((x) => x.json()) as Promise<ApiResponse<UserWithCount>>,
    queryKey: ["user", item?.data.user_id],
    enabled: !!item && item.status === "success",
    onSuccess(data) {
      if (data.status === "success") {
        setSeller(data.data);
      } else {
        console.error("cannot find seller");
      }
    },
  });

  console.log("seller: ", seller);

  const [index, setIndex] = useState(0);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    setIndex(viewableItems[0].index);
  }).current;

  return (
    <SafeAreaView className="h-full bg-bgLight">
      <Pressable onPress={router.back} className="p-3">
        <CloseIcon />
      </Pressable>

      {item ? (
        <>
          <FlatList
            data={item.data.item_images}
            renderItem={({ item }) => (
              <Image
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
          />
          <View className="relative">
            {item.data.item_images.length > 1 && (
              <PaginationDots
                data={item.data.item_images}
                currentIndex={index}
              />
            )}
          </View>
          <View className="w-full flex flex-col p-3 py-3">
            <Text className="text-sm font-Manrope_600SemiBold">
              {item.data.name}
            </Text>
            <Text className="text-2xl text-purplePrimary">
              ${item.data.price}
            </Text>
          </View>
          <View className="h-2 bg-grayLight" />
          <View className="p-2 flex flex-col gap-y-2">
            <View className="flex flex-row gap-x-0.5">
              <DescriptionIcon />
              <Text className="text-sm">Description</Text>
            </View>

            <View>
              <Text className="font-Manrope_300Light text-sm pl-2">
                {item.data.description || "No description provided."}
              </Text>
            </View>
          </View>

          <View className="h-2 bg-grayLight" />

          <View className="p-3">
            <Text className="font-Poppins_600SemiBold text-base">Seller</Text>
            <View className="flex flex-row">
              <Image
                source={{
                  uri: seller?.name,
                }}
                style={{
                  borderColor: Colors.whitePrimary,
                }}
                className="w-[53px] h-[53px] rounded-full  border bg-blackPrimary"
              />
              <View className="flex flex-col gap-y-1 ml-2">
                <Text className="font-Manrope_400Regular text-sm text-blackPrimary">
                  {seller?.name ?? "loading..."}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text>Loading</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const DescriptionIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 16 16" fill="none">
    <Path
      d="M5.2551 5.786C5.25373 5.81829 5.25898 5.85053 5.27053 5.88072C5.28208 5.91091 5.29968 5.93841 5.32225 5.96155C5.34482 5.98468 5.37189 6.00296 5.40179 6.01524C5.43168 6.02753 5.46378 6.03357 5.4961 6.033H6.3211C6.4591 6.033 6.5691 5.92 6.5871 5.783C6.6771 5.127 7.1271 4.649 7.9291 4.649C8.6151 4.649 9.2431 4.992 9.2431 5.817C9.2431 6.452 8.8691 6.744 8.2781 7.188C7.6051 7.677 7.0721 8.248 7.1101 9.175L7.1131 9.392C7.11415 9.45761 7.14095 9.52017 7.18772 9.5662C7.23449 9.61222 7.29748 9.63801 7.3631 9.638H8.1741C8.2404 9.638 8.30399 9.61166 8.35087 9.56478C8.39776 9.51789 8.4241 9.4543 8.4241 9.388V9.283C8.4241 8.565 8.6971 8.356 9.4341 7.797C10.0431 7.334 10.6781 6.82 10.6781 5.741C10.6781 4.23 9.4021 3.5 8.0051 3.5C6.7381 3.5 5.3501 4.09 5.2551 5.786ZM6.8121 11.549C6.8121 12.082 7.2371 12.476 7.8221 12.476C8.4311 12.476 8.8501 12.082 8.8501 11.549C8.8501 10.997 8.4301 10.609 7.8211 10.609C7.2371 10.609 6.8121 10.997 6.8121 11.549Z"
      fill="black"
    />
  </Svg>
);
