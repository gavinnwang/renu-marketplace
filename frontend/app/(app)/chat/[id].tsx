import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Colors from "../../../constants/Colors";
import React, { useEffect } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChatMessage, Item } from "../../../types";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";
import useWebSocket from "react-use-websocket";
import { FlashList } from "@shopify/flash-list";
import { useSession } from "../../../hooks/useSession";
import {
  API_URL,
  getChatIdFromItemId,
  getItem,
  parseOrThrowResponse,
} from "../../../api";

export default function ChatScreen() {
  const router = useRouter();
  const {
    id: itemId,
    chatIdParam,
    sellOrBuy,
    newChat,
    otherUserName,
  } = useLocalSearchParams();
  const { session } = useSession();

  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  const { data: chatId, isError: isErrorChatId } = useQuery({
    queryFn: async () => getChatIdFromItemId(session!.token, itemId as string),
    queryKey: ["chat_id", itemId],
    enabled: !!itemId && !chatIdParam && !!session && !newChat, // run the query if there is no chat id param and is not a new chat
    placeholderData: parseInt(chatIdParam as string),
  });

  const { data: item, isError: isErrorData } = useQuery({
    queryFn: () => getItem(itemId as string),
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });

  // const [offset, setOffset] = React.useState(0);
  // const limit = 25;
  // const [endReached, setEndReached] = React.useState(false);

  const getChatMessages = async ({ pageParam = 0 }) => {
    console.debug("fetching messages with offset", pageParam);
    const res = await fetch(
      `${API_URL}/chats/messages/${chatId}?offset=${pageParam}`,
      {
        headers: {
          authorization: `Bearer ${session?.token}`,
        },
      }
    );
    return parseOrThrowResponse<{
      data: ChatMessage[];
      next_offset: number;
    }>(res);
  };

  const {
    data: chatMessagesData,
    isLoading: isLoadingChatMessages,
    isError: isErrorChatMessages,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryFn: getChatMessages,
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    getNextPageParam: (lastPage) => lastPage.next_offset,
  });

  const width = Dimensions.get("window").width / 7;
  const [inputText, setInputText] = React.useState("");

  let socketUrl = "wss://api.gavinwang.dev/ws";
  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    queryParams: {
      authorization: `Bearer_${session?.token}`,
    },
    shouldReconnect: () => true,
    onOpen: () => {
      console.debug("opened");
      if (chatId) {
        console.debug("joining chat after openning");
        sendMessage(`/join ${chatId}`);
      }
    },
    reconnectInterval: 5,
  });

  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     setChatMessages((prev) => [
  //       {
  //         id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
  //         content: lastMessage.data,
  //         from_me: 0,
  //         sent_at: new Date(),
  //       } as ChatMessage,
  //       ...prev,
  //     ]);
  //     setOffset((prev) => prev + 1);
  //   }
  // }, [lastMessage]);

  return (
    <SafeAreaView className="bg-bgLight">
      <View className="bg-bgLight h-full">
        <View className="flex flex-row items-center justify-between ">
          <Pressable onPress={router.back} className="w-10 p-3">
            <CloseIcon />
          </Pressable>
          {otherUserName && (
            <Text className="font-Poppins_600SemiBold text-base text-blackPrimary ">
              {otherUserName}
            </Text>
          )}
          <View className="w-10 p-3" />
        </View>

        <View className="border-y border-y-stone-400">
          <Pressable
            onPress={() => router.push(`/item/${item?.id}`)}
            className="p-3.5 flex-row justify-between items-center bg-stone-50"
            style={{
              height: (width * 4) / 3 + 28,
              opacity: item?.status === "inactive" ? 0.75 : 1,
            }}
          >
            {item && (
              <Image
                transition={{
                  effect: "cross-dissolve",
                  duration: 250,
                }}
                placeholder={"TCLqY200RSDlM{_24o4n-:~p?b9F"}
                source={{ uri: item.images[0] }}
                className="object-cover rounded-sm"
                style={{
                  minWidth: width,
                  minHeight: (width * 4) / 3,
                  width: width,
                  height: (width * 4) / 3,
                }}
              />
            )}
            <View className="mx-4 flex flex-grow flex-col">
              {item && (
                <>
                  <Text className="font-Poppins_600SemiBold text-base text-blackPrimary">
                    {item.name}
                  </Text>
                  <Text className="font-Manrope_400Regular text-sm max-w-[250px] max-h-[40px] text-blackPrimary">
                    {item.description}
                  </Text>
                  <Text className="font-Manrope_600SemiBold text-sm text-blackPrimary">
                    {item.status === "inactive"
                      ? "Item is no longer available."
                      : ""}
                  </Text>
                </>
              )}
            </View>
            <Text className="font-Poppins_600SemiBold text-base text-blackPrimary">
              ${item && item.price}
            </Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={64}
        >
          <FlashList
            data={chatMessages}
            renderItem={Message}
            keyExtractor={(_, index) => index.toString()}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            inverted
            estimatedItemSize={20}
            onEndReached={() => {
              // if ( !chatId) return;
              if (!hasNextPage) {
                console.debug("no next page");
                return;
              }
              console.debug("refetching messages");
              fetchNextPage();
              // refetch();
            }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              padding: 10,
            }}
          />

          <View>
            <TextInput
              placeholder="Message"
              className="px-4 py-2 mx-2 border rounded-full border-gray-400"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={async () => {
                if (!inputText.trim()) return;
                if (chatMessages === undefined) {
                  console.debug("chat messages undefined");
                  return;
                }
                if (!chatId && item) {
                  console.debug("no chat id so create one");
                  try {
                    const res = await fetch(`${API_URL}/chats/${item.id}`, {
                      headers: {
                        authorization: `Bearer ${session?.token}`,
                        "content-type": "application/json",
                      },
                      method: "POST",
                      body: JSON.stringify({
                        first_message_content: inputText,
                      }),
                    }); // TODO use mutation
                    setInputText("");
                    const createdChatId: number = await res.json();
                    sendMessage(`/join ${createdChatId}`);
                    console.debug(
                      "joining chat id ",
                      createdChatId,
                      "after creating"
                    );
                    console.debug("set chat id to new chat id", createdChatId);
                    queryClient.setQueryData(
                      ["chat_id", itemId],
                      createdChatId
                    );
                    console.debug("invalidating:", ["chats", sellOrBuy]);
                    queryClient.invalidateQueries(["chats", sellOrBuy]);
                  } catch (err) {
                    console.error("parse post messgae", err);
                  }
                  return;
                }
                sendMessage(`/message ${chatId} ${inputText}`);
                setInputText("");
                queryClient.invalidateQueries(["chats", sellOrBuy]);
                // const lastPageArray =
                //   chatMessages.pages[Math.max(0, chatMessages.pages.length - 1)]
                //     .data;
                // const newMessage: ChatMessage = {
                //   id:
                //     lastPageArray.length > 0
                //       ? lastPageArray[lastPageArray.length - 1].id + 1
                //       : 1,
                //   content: inputText,
                //   from_me: 1,
                //   sent_at: new Date(),
                // } as ChatMessage;

                // const newPageArray = [...lastPageArray, newMessage];
                // queryClient.setQueryData(["messages", chatId], (data: any) => ({
                //   pages: newPageArray,
                //   pageParams: data.pageParams,
                // }));
                // queryClient.invalidateQueries(["messages", chatId]);
                //   fetch(
                //     `${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/${item.id}`,
                //     {
                //       headers: {
                //         authorization: `Bearer ${session?.token}`,
                //         "content-type": "application/json",
                //       },
                //       method: "POST",
                //       body: JSON.stringify({
                //         first_message_content: inputText,
                //       }),
                //     }
                //   ).then((x) => {
                //     x.json()
                //       .then((data: number) => {
                //         sendMessage(`/join ${data}`);
                //         console.debug("JOINING CHAT ID AFTER CREATING");

                //         setInputText("");

                //         setChatMessages([
                //           {
                //             id: 1,
                //             content: inputText,
                //             from_me: 1,
                //             sent_at: new Date(),
                //           } as ChatMessage,
                //         ]);
                //         setOffset(1);
                //         setChatId(data);
                //         console.debug("invalidating:", ["chats", sellOrBuy]);
                //         queryClient.invalidateQueries(["chats", sellOrBuy]);
                //       })
                //       .catch((err) => {
                //         console.error("parse post messgae", err);
                //       });
                //   });
                //   return;
                // }
                // sendMessage(`/message ${chatId} ${inputText}`);
                // setInputText("");
                // queryClient.invalidateQueries(["chats", sellOrBuy]);

                // setChatMessages((prev) => [
                //   {
                //     id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
                //     content: inputText,
                //     from_me: 1,
                //     sent_at: new Date(),
                //   } as ChatMessage,
                //   ...prev,
                // ]);
                // setOffset((prev) => prev + 1);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const Message = ({ item: message }: { item: ChatMessage }) => {
  return (
    <>
      <View
        className={`flex flex-row border border-stone-300 rounded-lg p-2.5 w-fit mb-3 ${
          message.from_me ? "ml-auto bg-stone-100" : "mr-auto bg-stone-100"
        }`}
      >
        <Text>{message.content}</Text>
      </View>
    </>
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
