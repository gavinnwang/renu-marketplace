import {
  Dimensions,
  Image,
  View,
  Text,
  type DimensionValue,
} from "react-native";
import { Item } from "@prisma/client";

const dimensions = Dimensions.get("window");
const imagePercentage = 0.49;

export function ItemListing(props: { item: Item }) {
  return (
    <View className="flex flex-col">
      {/* <Link href={`item/${props.item.id}`} className="flex flex-col"> */}
      <Image
        source={{ uri: props.item.image_url }}
        className="object-cover"
        style={{
          width: (dimensions.width * imagePercentage) as DimensionValue,
          height: (dimensions.width * imagePercentage * 4) / 3,
        }}
      />
      <View className="mx-1">
        <View className="flex flex-row items-center">
          <Text className="color-[#4E2A84] font-Manrope_600SemiBold text-base mr-1">
            ${props.item.price.toFixed(2)}
          </Text>
          {props.item.original_price != null ? (
            <Text className="font-Manrope_500Medium text-sm text-[#181818] line-through">
              ${props.item.original_price}
            </Text>
          ) : null}
        </View>
        <Text className="font-Manrope_500Medium text-sm text-[#252525]z">
          {props.item.name}
        </Text>
      </View>
    </View>
    // </Link>
  );
}
