import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Item } from "@prisma/client";
import { ItemListingGrid } from "../../../../components/ItemListingGrid";
import { useQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { useState } from "react";
import { ApiResponse } from "../../../../types/api";

const SECTIONS = [
  { display: "Men's", value: "mens" },
  { display: "Women's", value: "womens" },
  { display: "Life/Tools", value: "lifetools" },
  { display: "Furniture", value: "furniture" },
  { display: "Electronics", value: "electronics" },
];


export default function HomePage() {
  const param = useLocalSearchParams();
  const selectedSection = param.section;

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/items/`).then((x) =>
        x.json()
      ) as Promise<ApiResponse<Item[]>>,
    queryKey: ["item"],
  });
  const [refreshing, _] = useState(false);

  return (
    <>
      <View className="bg-bgLight h-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
          }}
          className="border-y border-grayLight flex flex-row  min-h-[42px] max-h-[42px]"
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
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetchItems} />
          }
        >
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
