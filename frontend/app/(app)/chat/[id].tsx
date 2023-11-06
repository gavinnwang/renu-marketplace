import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Colors from "../../../constants/Colors";
import React from "react";

export default function ChatScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-bgLight">
      <View className="h-full bg-bgLight">
        <View className="flex flex-row">
          <Pressable onPress={router.back} className="p-3">
            <CloseIcon />
          </Pressable>e
        </View>
      </View>
    </SafeAreaView>
  );
}

const CloseIcon = () => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke={Colors.grayPrimary}
    className="w-6 h-6"
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      d="M6 18L18 6M6 6l12 12"
    />
  </Svg>
);
