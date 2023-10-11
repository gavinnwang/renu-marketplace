import { Link } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

export default function FailedSignIn() {
  return (
    <View className="bg-bgLight h-full">
      <Text className="text-red-500 text-xl text-center">
        Failed to sign in
      </Text>
      <Link href="/" className="text-center text-lg font-bold">
        Go back
      </Link>
      <Text className="text-gray-500 text-center mt-2">
        Make sure you are using a Northwestern Email account
      </Text>
    </View>
  );
}
