import { router, useLocalSearchParams } from "expo-router";
import { Text, Pressable, SafeAreaView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Image } from "../../../components/Image";
import { useQuery } from "@tanstack/react-query";
import { Item } from "@prisma/client";
import Colors from "../../../constants/Colors";

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
      <Pressable onPress={router.back} className="p-3">
        <CloseIcon />
      </Pressable>

      {item ? (
        <>
          <Image
            percentageHeight={1}
            percentageWidth={1}
            url={item.data.image_url}
          />
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
