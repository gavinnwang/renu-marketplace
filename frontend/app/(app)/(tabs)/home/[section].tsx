import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";
import { LogoWithText } from "../../../../components/Logo";
import { Item } from "@prisma/client";
import { ItemListingGrid } from "../../../../components/ItemListingGrid";
import { useQuery } from "@tanstack/react-query";

const SECTIONS = [
  { display: "Men's", value: "mens" },
  { display: "Women's", value: "womens" },
  { display: "Life/Tools", value: "lifetools" },
  { display: "Furniture", value: "furniture" },
  { display: "Electronics", value: "electronics" },
];

// const items: Item[] = [
//   {
//     created_at: new Date(),
//     id: 0,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 55,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 5,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 7,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 222,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 11,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 2,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 33,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
//   {
//     created_at: new Date(),
//     id: 3,
//     image_url: "https://picsum.photos/seed/696/3000/2000",
//     name: "item name",
//     price: 123.456,
//     updated_at: new Date(),
//     user_id: 0,
//     original_price: 100,
//   },
// ];

interface ApiResponse<T> {
  data: T;
  status: "success" | "failure";
}

export default function HomePage() {
  const param = useLocalSearchParams();
  const selectedSection = param.section;

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/items/`).then(x =>
        x.json(),
      ) as Promise<ApiResponse<Item[]>>,
  });

  console.log({ items });

  return (
    <>
      <View className="bg-[#f9f9f9] h-full">
        <View className="mx-[10px] ">
          <View className="flex flex-row items-center">
            <LogoWithText className="flex-grow" />
            <View className="flex justify-center items-center bg-[#F0F0F0] rounded-md flex-grow-[2] ml-1">
              <TextInput placeholder="Search here" className="p-2 w-full" />
            </View>
          </View>

          <View className="border-y border-[#EEEEEE] flex flex-row mt-3 justify-between py-2">
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
        </View>
        <ScrollView>
          <Text className="font-Poppins_500Medium text-xl m-2">Browse</Text>
          {isLoadingItems ? (
            <Text>...</Text>
          ) : isErrorItems ? (
            <Text className="text-red-500">Something went wrong</Text>
          ) : (
            <ItemListingGrid items={items.data} />
          )}
        </ScrollView>
      </View>
    </>
  );
}
