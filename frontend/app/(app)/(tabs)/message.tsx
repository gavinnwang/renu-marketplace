import { Text, View } from "react-native";

export default function MessageScreen() {
  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Messages
      </Text>
    </View>
  );
}

const MessageTab = () => {
  return (
    <View className="flex flex-row items-center justify-between pl-4 pr-6 pb-2.5 min-h-[43px]">
      <Text>Message</Text>
    </View>
  );
};
