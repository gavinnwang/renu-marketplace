import { Link, Stack, useLocalSearchParams } from "expo-router";
import {
  DimensionValue,
  Dimensions,
  Text,
  TextInput,
  View,
} from "react-native";
import { LogoWithText } from "../../../components/Logo";
import { Item } from "@prisma/client";

const SECTIONS = [
  { display: "Men's", value: "mens" },
  { display: "Women's", value: "womens" },
  { display: "Life/Tools", value: "lifetools" },
  { display: "Furniture", value: "furniture" },
  { display: "Electronics", value: "electronics" },
];

const items: Item[] = [
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
  {
    created_at: new Date(),
    id: 0,
    image_url: "https://picsum.photos/seed/696/3000/2000",
    name: "item name",
    price: 123.456,
    updated_at: new Date(),
    user_id: 0,
    original_price: 100,
  },
];

export default function HomePage() {
  const param = useLocalSearchParams();

  const chunkedItems = useMemo(() => {
    return items.reduce((results, value, idx, arr) => {
      if (idx % 2 === 0) results.push(arr.slice(idx, idx + 2));
      return results;
    }, [] as Item[][]);
  }, [items]);

  const selectedSection = param.section;
  console.log("EEEEEEEEEE", selectedSection);

  return (
    <>
      <Stack.Screen options={{ title: "hello!" }} />
      <View className="">
        <View className="mx-[10px]">
          <View className="flex flex-row items-center">
            <LogoWithText className="flex-grow" />
            <View className="flex justify-center items-center bg-[#F0F0F0] rounded-md flex-grow-[2]">
              <TextInput placeholder="Search here" className="p-2 w-full" />
            </View>
          </View>

          <View className="border-y border-[#EEEEEE] flex flex-row mt-3 justify-between py-1">
            {SECTIONS.map(section => {
              return (
                <Link key={section.value} href={`/home/${section.value}`}>
                  <Text
                    className={`font-Poppins_400Regular text-sm  ${
                      section.value === selectedSection
                        ? "text-[#4E2A84] underline underline-offset-8"
                        : "text-[#949494]"
                    }`}>
                    {section.display}
                  </Text>
                </Link>
              );
            })}
          </View>
          <Text className="font-Poppins_500Medium text-xl mt-4">Browse</Text>
        </View>

        {chunkedItems.map(itemPair => (
          <View
            key={itemPair[0].id}
            className="flex flex-row justify-between mb-6">
            {itemPair.map(item => (
              <ItemListing key={item.id} item={item} />
            ))}
          </View>
        ))}
      </View>
    </>
  );
}

import { Image } from "react-native";
import { useMemo } from "react";

const dimensions = Dimensions.get("window");
const imagePercentage = 0.49;

function ItemListing(props: { item: Item }) {
  return (
    <View className="flex flex-col">
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
  );
}
