import { Text, TouchableOpacity, View } from "react-native";

export default function RefreshScreen({
  displayText,
  refetch,
  marginTop = "50%",
}: {
  displayText: string;
  refetch: () => void;
  marginTop?: string;
}) {
  return (
    <View className="flex-grow flex flex-col justify-center items-center w-full">
      <Text className="font-Poppins_600SemiBold text-lg">{displayText}</Text>
      <TouchableOpacity
        onPress={refetch}
        className="border-[1.5px] mt-4 h-[45px] w-[180px] mx-auto flex items-center justify-center rounded-sm"
      >
        <Text className="font-Poppins_500Medium">Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}
