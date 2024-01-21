import { Text, TouchableOpacity, View } from "react-native";

export default function RefreshScreen({
  displayText,
  refetch,
}: {
  displayText: string;
  refetch: () => void;
}) {
  return (
    <View className="flex-grow flex flex-col justify-center items-center w-full">
      <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
        {displayText}
      </Text>
      <TouchableOpacity
        onPress={refetch}
        className="border-[1.5px] border-blackPrimary dark:border-bgLight mt-4 h-[45px] w-[180px] mx-auto flex items-center justify-center rounded-sm"
      >
        <Text className="font-Poppins_500Medium text-blackPrimary dark:text-bgLight">
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  );
}
