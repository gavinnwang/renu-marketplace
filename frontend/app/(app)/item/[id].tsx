import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Button, Pressable, SafeAreaView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Image } from "../../../components/Image";
import { useQuery } from "@tanstack/react-query";
import { Item } from "@prisma/client";

const LeftIcon = () => (
  <Svg width="25" height="33" viewBox="0 0 25 33" fill="none">
    <Path
      d="M14.5833 9.625L9.375 16.5L14.5833 23.375"
      stroke="#958F91"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

interface ApiResponse<T> {
  data: T;
  status: "success" | "failure";
}

export default function ItemPage() {
  const param = useLocalSearchParams();
  const itemId = param.id;

  const { data: item } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/items/${itemId}`).then(
        (x) => x.json()
      ) as Promise<ApiResponse<Item>>,
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });


  return (
    <SafeAreaView className="h-full bg-bgLight">
      <View className="flex flex-row">
        <Pressable onPress={router.back}>
          <LeftIcon />
        </Pressable>
      </View>
      {item ? (
        <>
          <Image percentageHeight={1} percentageWidth={1} url={item.data.image_url} />
          <Text className="font-Manrope_600SemiBold text-sm">
            {item.data.name}
          </Text>
          <Pressable className="bg-purplePrimary mx-16 p-2 rounded-lg mt-6">
            <Text className="text-white text-center text-lg">Purchase</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text>Item could not be loaded.</Text>
        </>
      )}
    </SafeAreaView>
  );
}
