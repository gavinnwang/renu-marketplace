import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Colors from "../../../../shared/constants/Colors";
import React from "react";
import { useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getSearchItems } from "../../../api";
import { FlashList } from "@shopify/flash-list";
import { ItemListing } from "../../../components/ItemListing";

const Stack = createNativeStackNavigator();
export default function MyStack() {
  const colorScheme = useColorScheme();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={SearchPage}
        options={{
          headerTitleStyle: {
            color:
              colorScheme === "light" ? Colors.light.text : Colors.dark.text,
            fontFamily: "Poppins_600SemiBold",
            fontSize: 20,
          },
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor:
              colorScheme === "light"
                ? Colors.light.background
                : Colors.dark.background,
          },
        }}
      />
    </Stack.Navigator>
  );
}
import * as SecureStore from "expo-secure-store";

export function SearchPage() {
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  React.useEffect(() => {
    const loadSearchHistory = async () => {
      console.debug("loading search history");
      const searchHistoryString = await SecureStore.getItemAsync(
        "searchHistory"
      );
      if (searchHistoryString) {
        setSearchHistory(JSON.parse(searchHistoryString));
      }
    };
    loadSearchHistory();
  }, []);
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
          const searchQuery = event.nativeEvent.text.trim() as string;
          setSearchQuery(searchQuery);
          if (!searchQuery) {
            return;
          }
          setSearchHistory((searchHistory) => {
            const newSearchHistory = [searchQuery, ...searchHistory];
            return newSearchHistory;
          });
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

  React.useEffect(() => {
    const saveSearchHistory = async () => {
      await SecureStore.setItemAsync(
        "searchHistory",
        JSON.stringify(searchHistory)
      );
    };
    saveSearchHistory();
  }, [searchHistory]);
  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <View className="h-[54px]"></View>
      {searchQuery.length === 0 ? (
        searchHistory.length === 0 ? (
          <View className="flex-grow flex flex-col justify-center items-center w-full">
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              Search for items!
            </Text>
          </View>
        ) : (
          <View className="flex-grow flex flex-col mt-[16%] items-center w-full">
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              Recent searches
            </Text>
            <View className="flex flex-row flex-wrap justify-center items-center w-full">
              {searchHistory.map((searchQuery, index) => (
                <TouchableOpacity
                  onPress={() => {
                    // focus search bar
                    setSearchQuery(searchQuery);
                  }}
                  className="px-2 py-1 m-1 rounded-md bg-bgLighter"
                  key={index}
                >
                  <Text>{searchQuery}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
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
        <></>
      ) : (
        !!searchQuery &&
        searchItems &&
        searchItems.length === 0 && (
          <View className="flex-grow flex flex-col justify-center items-center w-full">
            <Text className="font-Poppins_600SemiBold text-lg">
              No items found!
            </Text>
          </View>
        )
      )}
    </View>
  );
}
