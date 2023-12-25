import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import Colors from "../../../constants/Colors";
import React from "react";
import { useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getSearchItems } from "../../../api";
import { FlashList } from "@shopify/flash-list";
import { ItemListing } from "../../../components/ItemListing";

const Stack = createNativeStackNavigator(); 
export default function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={SearchPage}
        options={{
          headerTitleStyle: {
            color: Colors.blackPrimary,
            fontFamily: "Poppins_600SemiBold",
            fontSize: 20,
          },
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />
    </Stack.Navigator>
  );
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    data: searchItems,
    isLoading: isSearchItemsLoading,
    isError: isSearchItemsError,
  } = useQuery({
    queryKey: ["search_items", searchQuery],
    queryFn: () => getSearchItems(searchQuery),
    enabled: !!searchQuery.length,
  });

  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onSearchButtonPress: (event: any) => {
          setSearchQuery(event.nativeEvent.text.trim());
        },
        onCancelButtonPress: () => {
          setSearchQuery("");
        },
        onChangeText(event: any) {
          if (event.nativeEvent.text.length === 0) {
            setSearchQuery("");
          }
        },
      },
    });
  }, [navigation]);

  return (
    <View className="bg-bgLight h-full">
      <View className="h-[54px]"></View>
      {searchQuery.length === 0 ? (
        <View className="bg-bgLight h-full mt-[70%]">
          <View className="flex flex-col items-center">
            <Text className="font-Poppins_600SemiBold text-lg">
              Search for items!
            </Text>
          </View>
        </View>
      ) : searchItems && searchItems.length > 0 ? (
        <FlashList
          className="bg-bgLight h-full"
          showsVerticalScrollIndicator={false}
          data={searchItems}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 10,
            paddingLeft: 10,
          }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={ItemListing}
          estimatedItemSize={320}
          removeClippedSubviews={true}
        />
      ) : isSearchItemsLoading ? (
        <View className="bg-bgLight h-full mt-[70%]">
          <View className="flex flex-col items-center">
            <Text className="font-Poppins_600SemiBold text-lg">...</Text>
          </View>
        </View>
      ) : (
        !!searchQuery &&
        searchItems &&
        searchItems.length === 0 && (
          <View className="bg-bgLight h-full mt-[70%]">
            <View className="flex flex-col items-center">
              <Text className="font-Poppins_600SemiBold text-lg">
                No results found.
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}
