import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Colors from "../../../../shared/constants/Colors";
import React from "react";
import { useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getPopularSearchQueries, getSearchItems } from "../../../api";
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
import { Path, Svg } from "react-native-svg";

function removeDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    if (!seen.has(item)) {
      seen.add(item);
      return true;
    }
    return false;
  });
}

export function SearchPage() {
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  React.useEffect(() => {
    const loadSearchHistory = async () => {
      console.debug("loading search history");
      const searchHistoryString = await SecureStore.getItemAsync(
        "searchHistory"
      );
      if (searchHistoryString) {
        try {
          const searchHistory = JSON.parse(searchHistoryString);
          setSearchHistory(removeDuplicates(searchHistory));
        } catch (e) {
          console.error(e);
        }
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

  const [pressedHistory, setPressedHistory] = React.useState(false);
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onSearchButtonPress: (event: any) => {
          setPressedHistory(false);
          const searchQuery = event.nativeEvent.text.trim() as string;
          setSearchQuery(searchQuery);
          if (!searchQuery) {
            return;
          }
          setSearchHistory((searchHistory) => {
            const newSearchHistory = [searchQuery, ...searchHistory];
            return removeDuplicates(newSearchHistory);
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

  const { data: popularSearches } = useQuery({
    queryKey: ["popular_searches"],
    queryFn: () => getPopularSearchQueries(),
  });
  const SearchTermsDisplay = ({ searches }: { searches: string[] }) => {
    return (
      <View className="flex flex-row flex-wrap justify-center items-center w-full">
        {searches.map((searchQuery, index) => (
          <TouchableOpacity
            onPress={() => {
              // focus search bar
              setSearchQuery(searchQuery);
              setSearchHistory((searchHistory) => {
                const newSearchHistory = [
                  searchQuery,
                  ...searchHistory.filter((item) => item !== searchQuery),
                ];
                return newSearchHistory;
              });
              setPressedHistory(true);
            }}
            className="px-2 py-1 m-1 rounded-md"
            key={index}
          >
            <View className="bg-[#e9e9e9] dark:bg-[#44403c] p-1.5 rounded-lg">
              <Text className="text-blackPrimary dark:text-bgLight">
                {searchQuery}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <View className="h-[54px]"></View>
      {searchQuery.length === 0 ? (
        <View className="flex-grow flex flex-col justify-center items-center w-full">
          <View className="flex-grow flex flex-col mt-[16%] items-center w-full">
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              Popular searches
            </Text>
          </View>
          {searchHistory.length === 0 ? (
            <></>
          ) : (
            <View className="flex-grow flex flex-col mt-[16%] items-center w-full">
              <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
                Recent searches
              </Text>
              <SearchTermsDisplay searches={searchHistory} />
              {searchHistory.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchHistory([]);
                    SecureStore.deleteItemAsync("searchHistory");
                  }}
                  className="px-2 py-1 m-1 rounded-md"
                >
                  <View className="flex flex-row">
                    <TrashIcon />
                    <Text className="ml-1 text-[#a8a29e] dark:text-stone-600">
                      Clear history
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : searchItems && searchItems.length > 0 ? (
        <FlashList
          className="bg-bgLight h-full dark:bg-blackPrimary"
          showsVerticalScrollIndicator={false}
          data={searchItems}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: pressedHistory ? 60 : 10,
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
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              No items found!
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const TrashIcon = () => {
  const colorScheme = useColorScheme();
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke={colorScheme === "light" ? "#a8a29e" : "#525252"}
      className="w-4 h-4"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </Svg>
  );
};
