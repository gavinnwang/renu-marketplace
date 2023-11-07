import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Colors from "../../../constants/Colors";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../../../types/api";
import { ChatMessage, ChatWindow } from "../../../types/types";
import { useSession } from "../../../providers/ctx";
import { Image } from "expo-image";
import { FlatList, TextInput } from "react-native-gesture-handler";

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

  const { isError: isErrorChatMessages, refetch } = useQuery({
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

  const width = Dimensions.get("window").width / 8;
  const [inputText, setInputText] = React.useState("");

  return (
    <SafeAreaView className="bg-bgLight">
      <View className="bg-bgLight h-full">
        <View className="flex flex-row items-center justify-between ">
          <Pressable onPress={router.back} className="w-10 p-3">
            <CloseIcon />
          </Pressable>
          {chatWindow && (
            <Text className="font-Poppins_600SemiBold text-base text-blackPrimary ">
              {chatWindow.other_user_name}
            </Text>
          )}
          <View className="w-10 p-3" />
        </View>

        <Pressable
          onPress={() => router.push(`/item/${chatWindow?.item_id}`)}
          className="p-4 flex-row justify-between  items-center border-y border-y-grayPrimary bg-gray-100"
          style={{
            height: (width * 4) / 3 + 32,
          }}
        >
          {chatWindow && (
            <Image
              source={{ uri: chatWindow.item_image }}
              className="object-cover rounded-sm"
              style={{
                minWidth: width,
                minHeight: (width * 4) / 3,
                width: width,
                height: (width * 4) / 3,
              }}
            />
          )}
          <View className="mx-4 flex flex-grow flex-col gap-y-1">
            <Text className="font-Poppins_600SemiBold text-sm text-blackPrimary">
              {chatWindow && chatWindow.item_name}
            </Text>
            <Text className="font-Manrope_400Regular text-xs max-w-[250px] max-h-[40px] text-blackPrimary">
              {chatWindow && chatWindow.item_description}
            </Text>
          </View>
          <Text className="font-Poppins_600SemiBold text-sm text-blackPrimary">
            ${chatWindow && chatWindow.item_price}
          </Text>
        </Pressable>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={64}
        >
          <FlatList
            className="p-4"
            data={chatMessages}
            renderItem={({ item }) => <Message message={item} />}
            keyExtractor={(item) => item.id.toString()}
          />

          <View className="fixed bottom-0 right-0 left-0">
            <TextInput
              placeholder="Message"
              className="px-4 py-2 mx-2 border rounded-full border-gray-400"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={(e) => {
                if (!inputText) return;
                setInputText("");
                fetch(
                  `${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/message/${chatId}`,
                  {
                    method: "POST",
                    headers: {
                      authorization: `Bearer ${session?.token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      content: e.nativeEvent.text,
                    }),
                  }
                ).then(() => {
                  refetch();
                });
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const Message = ({ message }: { message: ChatMessage }) => {
  return (
    <View
      className={`flex flex-row border mb-3 border-gray-300 rounded-lg bg-gray-100 p-2 w-fit ${
        message.from_me ? "ml-auto" : "mr-auto"
      }`}
    >
      <Text>{message.content}</Text>
    </View>
  );
};

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
