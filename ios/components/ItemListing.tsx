import { Dimensions, View, Text } from "react-native";
import { Link } from "expo-router";

import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { Item } from "../../shared/types";
import dayjs from "dayjs";
import Colors from "../../shared/constants/Colors";
import { IMAGES_URL } from "../../shared/api";
dayjs.extend(relativeTime);

const horizontalGapPx = 10;
const imageWidth = (Dimensions.get("window").width - horizontalGapPx * 3) / 2;

export function ItemListing({ item }: { item: Item }) {
  return (
    <Link
      href={{
        pathname: `/item/${item.id}`,
        params: {
          itemString: JSON.stringify(item).replace(/%/g, "~~pct~~"),
        },
      }}
      className="flex flex-col shadow-sm px-[5px] pt-3"
    >
      <View className="flex flex-col">
        <Image
          transition={{
            effect: "cross-dissolve",
            duration: 50,
          }}
          source={{ uri: `${IMAGES_URL}${item.images[0]}` }}
          className="object-cover rounded-t"
          style={{
            width: imageWidth,
            maxWidth: imageWidth,
            height: imageWidth * 1.3,
            backgroundColor: Colors.grayLight,
          }}
        />
        <View className="h-fit py-2 px-2.5 bg-white rounded-b flex flex-col">
          <Text className="font-Manrope_600SemiBold text-base max-h-[25px]">
            {item.name}
          </Text>
          <Text className="font-Manrope_500Medium text-xs">
            {dayjs(item.created_at).fromNow()}
          </Text>
          <Text className="text-purplePrimary font-Manrope_600SemiBold text-xl">
            ${item.price}
          </Text>
        </View>
      </View>
    </Link>
  );
}
