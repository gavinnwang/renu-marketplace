import {
  Dimensions,
  Image,
  View,
  Text,
} from "react-native";
import { Item } from "@prisma/client";
import { Link } from "expo-router";

const dimensions = Dimensions.get("window");
const imagePercentage = 0.495;
const imageWidth = (dimensions.width * imagePercentage);
console.log("imageWidth", imageWidth.toPrecision(3));

export function ItemListing(props: { item: Item }) {
  return (
    <Link href={`/item/${props.item.id}`} className={`flex flex-col max-w-[${(imageWidth - 10).toPrecision(3)}px] px-1 pb-3`}>
      <View className="flex flex-col">
        <Image
          source={{ uri: props.item.image_url }}
          className="object-cover"
          style={{
            width: imageWidth,
            height: (imageWidth * 4) / 3,
          }}
        />
        <View className="mx-1">
          <View className="flex flex-row items-center">
            <Text className="text-purplePrimary font-Manrope_600SemiBold text-base mr-1">
              ${props.item.price.toFixed(2)}
            </Text>
            {props.item.original_price != null ? (
              <Text className="font-Manrope_500Medium text-sm text-blackPrimary line-through">
                ${props.item.original_price}
              </Text>
            ) : null}
          </View>
          <Text className={`font-Manrope_500Medium text-sm text-blackPrimary line-clamp-2 `}>
            {props.item.name}
          </Text>
        </View>
      </View>
    </Link>
  );
}
