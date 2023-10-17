import { Dimensions, Image, View, Text } from "react-native";
import { Item } from "@prisma/client";
import { Link } from "expo-router";

const dimensions = Dimensions.get("window");
const imagePercentage = 0.45;

export function ItemListing(props: { item: any }) {
  console.log(new Date(props.item.created_at.secs_since_epoch * 1000));
  return (
    <Link href={`/item/${props.item.id}`} className="flex flex-col">
      <View className="flex flex-col">
        <Image
          source={{ uri: props.item.image_url }}
          className="object-cover"
          style={{
            width: (dimensions.width * imagePercentage) ,
            height: (dimensions.width * imagePercentage * 4) / 3,
          }}
        />
        <View className="mx-1 h-[66px]">
          <View className="flex flex-row items-center">
            <Text className="text-purplePrimary font-Manrope_600SemiBold text-base mr-1">
              ${props.item.price.toFixed(2)}
            </Text>
            {/* {props.item.original_price != null ? (
              <Text className="font-Manrope_500Medium text-sm text-blackPrimary line-through">
                ${props.item.original_price}
              </Text>
            ) : null} */}
          </View>
          <Text className={`font-Manrope_500Medium text-sm text-blackPrimary `}>
            {props.item.name.substring(0, 10)}
          </Text>
          <Text className={`font-Manrope_500Medium text-sm text-blackPrimary `}>
            {new Date(
              props.item.created_at.secs_since_epoch * 1000
            ).toLocaleDateString()}
            {new Date(
              props.item.created_at.secs_since_epoch * 1000
            ).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </Link>
  );
}
