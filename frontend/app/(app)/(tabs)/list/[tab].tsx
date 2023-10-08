import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";


export default function ListingPage() {
    const param = useLocalSearchParams();
    const selectedTab = param.tab;
  
    return (
        <View className="bg-[#F9F9F9] h-full">
          <Text>
            {selectedTab}
            </Text> 
        </View>
    )
} 