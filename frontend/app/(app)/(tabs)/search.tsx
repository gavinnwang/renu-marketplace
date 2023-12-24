import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import Colors from "../../../constants/Colors";

const Stack = createNativeStackNavigator();
export default function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={SearchPage}
        options={{
          headerSearchBarOptions: {
            placeholder: "Search",
          },
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
  return (
    <View className="bg-bgLight h-full">
      {/* <Text className="ml-2.5 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Search
      </Text> */}
    </View>
  );
}
