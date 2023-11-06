import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Colors from "../../../constants/Colors";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../../../types/api";
import { ChatWindow } from "../../../types/types";

export default function ChatScreen() {
  const router = useRouter();
  const param = useLocalSearchParams();
  const chatId = param.id;

  const [chatWindow, setChatWindow] = React.useState<ChatWindow | undefined>(
    undefined
  );
  const [chatMessages, setChatMessages] = React.useState<
    ChatWindow | undefined
  >(undefined);

  const { data: chatWindowData, isError: isErrorChatWindow } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/window/${chatId}`).then(
        (x) => x.json()
      ) as Promise<ApiResponse<ChatWindow>>,
    queryKey: ["chat", chatId],
    enabled: !!chatId,
    onSuccess(data) {
      if (data.status === "success") {
        setChatWindow(data.data);
      } else {
        console.error(data);
      }
    },
  });

  const { data: chatMessagesData, isError: isErrorChatMessages } = useQuery({
    queryFn: async () =>
      fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/messages/${chatId}`
      ).then((x) => x.json()) as Promise<ApiResponse<ChatWindow>>,
    queryKey: ["chat", chatId],
    enabled: !!chatId,
    onSuccess(data) {
      if (data.status === "success") {
        setChatMessages(data.data);
      } else {
        console.error(data);
      }
    },
  });

  return (
    <SafeAreaView className="bg-bgLight">
      <View className="h-full bg-bgLight">
        <View className="flex flex-row">
          <Pressable onPress={router.back} className="p-3">
            <CloseIcon />
          </Pressable>
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
