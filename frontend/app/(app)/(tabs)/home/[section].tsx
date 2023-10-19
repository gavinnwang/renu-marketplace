import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Item } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { useState } from "react";
import { ApiResponse } from "../../../../types/api";
import { ItemListing } from "../../../../components/ItemListing";
import { LogoWithText } from "../../../../components/Logo";

export const SECTIONS = [
  { display: "All", value: "all" },
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

  const HEADER_HEIGHT = 40;

  return (
    <View className="bg-bgLight h-full">
      <View className="flex flex-row items-center px-2.5 pb-2.5 h-[40px]">
        <LogoWithText className="flex-grow" />
        <View className="flex justify-center bg-grayLight items-center rounded-md flex-grow ml-2.5">
          <TextInput placeholder="Search here" className="p-2 w-full" />
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-y border-grayLight flex flex-row  min-h-[42px] max-h-[42px] "
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
              className="px-3 h-full justify-center"
            >
              <Text
                className={`font-Poppins_500Medium ${
                  section.value === selectedSection
                    ? "text-purplePrimary"
                    : "text-gray-400"
                }`}
              >
                {section.display}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* <Text className="font-Poppins_500Medium text-xl p-2 bg-red-200">
          Browse
        </Text> */}
      {isLoadingItems ? (
        <Text>...</Text>
      ) : isErrorItems ? (
        <Text>Something went wrong</Text>
      ) : (
        <FlatList
          className="bg-[#ECECEC]"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetchItems} />
          }
          data={items.data}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-evenly", marginTop: 12 }}
          renderItem={ItemListing}
        />
      )}
    </View>
  );
}
