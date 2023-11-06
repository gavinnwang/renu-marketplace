import { useLocalSearchParams, useRouter } from "expo-router";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Colors from "../../../constants/Colors";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../../../types/api";
import { ChatMessage, ChatWindow } from "../../../types/types";
import { useSession } from "../../../providers/ctx";
import { Image } from "expo-image";

export default function ChatScreen() {
  const router = useRouter();
  const param = useLocalSearchParams();
  const chatId = param.id;

  const { session } = useSession();

  const [chatWindow, setChatWindow] = React.useState<ChatWindow | undefined>(
    undefined
  );
  const [chatMessages, setChatMessages] = React.useState<
    ChatMessage[] | undefined
  >(undefined);

  const { isError: isErrorChatWindow } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/window/${chatId}`, {
        headers: {
          authorization: `Bearer ${session?.token}`,
        },
      }).then((x) => x.json()) as Promise<ApiResponse<ChatWindow>>,
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

  const { isError: isErrorChatMessages } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/messages/${chatId}`, {
        headers: {
          authorization: `Bearer ${session?.token}`,
        },
      }).then((x) => x.json()) as Promise<ApiResponse<ChatMessage[]>>,
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    onSuccess(data) {
      if (data.status === "success") {
        setChatMessages(data.data);
        console.log(data);
      } else {
        console.error(data);
      }
    },
  });

  const width = 50;

  return (
    <SafeAreaView className="bg-bgLight">
      <View className="bg-bgLight h-full">
        <View className="flex flex-row items-center justify-between ">
          <Pressable onPress={router.back} className="w-5 p-3">
            <CloseIcon />
          </Pressable>
          {chatWindow && (
            <Text className="font-Poppins_600SemiBold text-base text-blackPrimary ">
              {chatWindow.other_user_name}
            </Text>
          )}
          <View className="w-5 p-3" />
        </View>

        <Pressable
          onPress={() => router.push(`/item/${chatWindow?.item_id}`)}
         className="p-3 flex-row justify-between gap-x-4 items-center border-y border-grayPrimary bg-gray-50">
          {chatWindow && (
            <Image
              source={{ uri: chatWindow.item_image }}
              className="object-cover rounded-sm"
              style={{
                width: width,
                maxWidth: width,
                height: (width * 4) / 3,
              }}
            />
          )}
          <View className="flex flex-grow flex-col ">
            <Text className="font-Poppins_600SemiBold text-sm text-blackPrimary">
              {chatWindow && chatWindow.item_name}
            </Text>
            <Text className="font-Manrope_400Regular text-sm text-blackPrimary">
              {chatWindow && chatWindow.item_description}
            </Text>
          </View>
          <Text className="font-Poppins_600SemiBold text-sm text-blackPrimary">
            ${chatWindow && chatWindow.item_price}
          </Text>
        </Pressable>

        {chatMessages?.map((message) => (
          <View key={message.id} className="flex flex-row">
            <Text>{message.content}</Text>
          </View>
        ))}
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
