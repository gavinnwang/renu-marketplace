import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Button, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Image } from "../../../components/Image";
import { useQuery } from "@tanstack/react-query";
import { Item } from "@prisma/client";

const LeftIcon = () => (
  <Svg
    width="25"
    height="33"
    viewBox="0 0 25 33"
    fill="none"
    onPress={router.back}>
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
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/items/${itemId}`).then(
        x => x.json(),
      ) as Promise<ApiResponse<Item>>,
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });

  return (
    <View>
      <View className="flex flex-row">
        <LeftIcon />
      </View>
      {item != null ? (
        <>
          <Image percentageWidth={1} url={item.data.image_url} />
          <Text className="font-Manrope_600SemiBold text-sm">
            {item.data.name}
          </Text>
          {/*///className="bg-[#4E2A84]"*/}
          <Pressable className="bg-[#4E2A84] mx-16 p-2 rounded-lg mt-6">
            <Text className="text-white text-center text-lg">Purchase</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text>Hi</Text>
          <Text>Id: {itemId}</Text>
        </>
      )}
    </View>
  );
}
