import { Link, Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/items/`).then((x) =>
        x.json()
      ) as Promise<ApiResponse<Item[]>>,
    queryKey: ["item"],
  });

  return (
    <>
      <View className="bg-bgLight h-full">
        <View className="flex flex-row items-center mx-[10px]">
          <LogoWithText className="flex-grow" />
          <View className="flex justify-center bg-grayLight items-center rounded-md flex-grow-[2] ml-[10px]">
            <TextInput placeholder="Search here" className="p-2 w-full" />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
          }}
          className="border-y border-grayLight flex flex-row mt-3  max-h-[42px]"
        >
          {SECTIONS.map((section) => {
            return (
              <Pressable
                key={section.value}
                onPress={() => {
                  if (section.value === selectedSection) {
                    return;
                  }
                  void router.replace(`/home/${section.value}`);
                }}
                className="px-3"
              >
                <Text
                  className={`font-Poppins_400Regular ${
                    section.value === selectedSection
                      ? "text-purplePrimary"
                      : "text-blackPrimary"
                  }`}
                >
                  {section.display}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
