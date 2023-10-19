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
          className="object-cover rounded-t-sm"
          style={{
            width: imageWidth,
            maxWidth: imageWidth,
            height: (imageWidth * 4) / 3,
          }}
        />
        <View className="h-fit py-2 px-2.5 bg-white rounded-b-sm flex flex-col gap-y-0.5">
          <Text className={`font-Manrope_500Medium text-sm text-grayPrimary `}>
            {props.item.name.substring(0, 10)}
          </Text>
          <Text className={`font-Manrope_500Medium text-sm text-grayPrimary `}>
            {dayjs(props.item.created_at.secs_since_epoch * 1000).fromNow()}
          </Text>
            <Text className="text-purplePrimary font-Manrope_600SemiBold text-base mr-1">
              ${props.item.price.toFixed(2)}
            </Text>
        </View>
      </View>
    </Link>
  );
}
