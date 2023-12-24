import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import Colors from "../../../constants/Colors";
import React from "react";
import { useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getSearchItems } from "../../../api";

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
  function handleSearchQueryChange(query: string) {
    console.log("query", query);
    setSearchQuery(query.trim());
  }
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (event: any) => {
          handleSearchQueryChange(event.nativeEvent.text);
        },
      },
    });
  }, [navigation]);

  const {
    data: searchItems,
    isLoading: isSearchItemsLoading,
    isError: isSearchItemsError,
  } = useQuery({
    queryKey: ["savedItems"],
    queryFn: () => getSearchItems(searchQuery),
    enabled: !searchQuery.length,
  });

  return (
    <View className="bg-bgLight h-full">
      {/* <Text className="ml-2.5 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Search
      </Text> */}
    </View>
  );
}
