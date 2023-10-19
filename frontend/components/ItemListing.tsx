import { Dimensions, Image, View, Text } from "react-native";
import { Link } from "expo-router";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const dimensions = Dimensions.get("window");
const horizontalGapPx = 10;
const imageWidth = (dimensions.width - horizontalGapPx * 3) / 2;

export function ItemListing(props: { item: any }) {
  return (
    <Link href={`/item/${props.item.id}`} className="flex flex-col">
      <View className="flex flex-col">
        <Image
          source={{ uri: props.item.image_url }}
          className="object-cover rounded-t"
          style={{
            width: imageWidth,
            maxWidth: imageWidth,
            height: (imageWidth * 4) / 3,
          }}
        />
        <View className="h-fit py-2.5 px-2.5 bg-white rounded-b flex flex-col ">
          <Text className="text-purplePrimary font-Manrope_600SemiBold text-base">
            ${props.item.price.toFixed(2)}
          </Text>
          <Text className={`font-Manrope_500Medium text-sm  `}>
            {props.item.name.substring(0, 10)}
          </Text>
          <Text className={`font-Manrope_500Medium text-xs `}>
            {dayjs(props.item.created_at.secs_since_epoch * 1000).fromNow()}
          </Text>
        </View>
      </View>
    </Link>
  );
}
