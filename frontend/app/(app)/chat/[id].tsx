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
import React from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChatMessage, ChatMessageProcessed } from "../../../types";
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
  postChatRoomWithFirstMessage,
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
  const queryClient = useQueryClient();

  const { data: chatId, isError: isErrorChatId } = useQuery({
    queryFn: async () => getChatIdFromItemId(session!.token, itemId as string),
    queryKey: ["chat_id", itemId],
    enabled: !!itemId && !chatIdParam && !!session && !newChat, // run the query if there is no chat id param and is not a new chat
    initialData: parseInt(chatIdParam as string),
  });

  const { data: item, isError: isErrorData } = useQuery({
    queryFn: () => getItem(itemId as string),
    queryKey: ["item", itemId],
    enabled: !!itemId,
  });

  const getChatMessages = async ({ pageParam = 0 }) => {
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
    data: chatMessages,
    isLoading: isLoadingChatMessages,
    isError: isErrorChatMessages,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryFn: getChatMessages,
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    getNextPageParam: (lastPage) => {
      const nextPage =
        lastPage.data.length === 25 ? lastPage.next_offset : undefined;
      return nextPage;
    },
  });

  const width = Dimensions.get("window").width / 7;
  const [inputText, setInputText] = React.useState("");

  const { sendMessage, lastMessage } = useWebSocket(
    "wss://api.gavinwang.dev/ws",
    {
      queryParams: {
        authorization: `Bearer_${session?.token}`,
      },
      shouldReconnect: () => true,
      onOpen: () => {
        if (chatId) {
          sendMessage(`/join ${chatId}`);
        }
      },
      reconnectInterval: 5,
      onMessage: (e) => {
        queryClient.invalidateQueries(["messages", chatId]);
      },
    }
  );

  const createChatRoomAndFirstMessageMutation = useMutation({
    mutationFn: (firstMessage: string) =>
      postChatRoomWithFirstMessage(
        session!.token,
        firstMessage,
        itemId as string
      ),
    onSuccess: (data) => {
      sendMessage(`/join ${data}`);
      queryClient.setQueryData(["chat_id", itemId], data);
      queryClient.invalidateQueries(["chats", sellOrBuy]);
      queryClient.invalidateQueries(["messages", data]);
    },
  });

  // const optimisticallyMutateChatMessages = useMutation({
  //   mutationFn: async (newMessage: string) => {
  //     if (!chatId) return;
  //     sendMessage(`/message ${chatId} ${newMessage}`);
  //   },
  //   onMutate: async () => {
  //     await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
  //     const lastPageArray =
  //       chatMessages?.pages[Math.max(0, chatMessages.pages.length - 1)].data ??
  //       [];
  //     const newMessage: ChatMessage = {
  //       id:
  //         lastPageArray.length > 0
  //           ? lastPageArray[lastPageArray.length - 1].id + 1
  //           : 1,
  //       content: inputText,
  //       from_me: 1,
  //       sent_at: new Date(),
  //     };
  //     const newPageArray = [...lastPageArray, newMessage];
  //     queryClient.setQueryData(["messages", chatId], (oldData: any) => {
  //       const newPages = oldData ? [...oldData.pages] : [];
  //       if (newPages.length === 0) {
  //         newPages.push({ data: [newMessage] });
  //       } else {
  //         newPages[newPages.length - 1].data = newPageArray;
  //       }
  //       return {
  //         pages: newPages,
  //         pageParams: oldData.pageParams,
  //       };
  //     });
  //   },
  // });
  const chatMessagesData = React.useMemo(() => {
    if (!chatMessages?.pages) {
      return [];
    }
    let lastDisplyTime: Date | null = null;
    return chatMessages.pages.flatMap((page) =>
      page.data.map((message) => {
        if (lastDisplyTime === null) {
          lastDisplyTime = new Date(message.sent_at);
          return message as ChatMessageProcessed;
        } else {
          const sentAtDate = new Date(message.sent_at);
          const timeDiff = lastDisplyTime.getTime() - sentAtDate.getTime();
          if (timeDiff > 1000 * 60 * 5) {
            // if more than 5 mins
            lastDisplyTime = sentAtDate;
            return message as ChatMessageProcessed;
          } else {
            return {
              ...message,
              sent_at: null,
            } as ChatMessageProcessed;
          }
        }
      })
    );
  }, [chatMessages]);
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

        <View className="border-y border-y-stone-200">
          <Pressable
            onPress={() =>
              router.push({
                pathname: `/item/${item!.id}`,
                params: {
                  itemString: JSON.stringify(item),
                },
              })
            }
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
            data={chatMessagesData}
            renderItem={Message}
            keyExtractor={(_, index) => index.toString()}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            inverted
            estimatedItemSize={20}
            onEndReached={() => {
              if (!hasNextPage) {
                console.debug("no next page");
                return;
              }
              console.debug("refetching messages");
              fetchNextPage();
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
                if (!chatId) {
                  console.debug("no chat id so create one");
                  createChatRoomAndFirstMessageMutation.mutate(inputText);
                  setInputText("");
                } else {
                  sendMessage(`/message ${chatId} ${inputText}`);
                  setInputText("");
                  queryClient.invalidateQueries(["messages", chatId]);
                  queryClient.invalidateQueries(["chats", sellOrBuy]);
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const Message = ({ item: message }: { item: ChatMessageProcessed }) => {
  return (
    <View
      className={`flex flex-row items-center ${
        message.from_me ? "ml-auto" : "mr-auto"
      }`}
    >
      {message.sent_at !== null && message.from_me ? (
        <Text className="mr-2 text-xs font-Manrope_500Medium text-grayPrimary">
          {dayjs(message.sent_at).fromNow()}
        </Text>
      ) : null}
      <View
        className={`flex flex-row rounded-xl p-2 w-fit my-1.5 ${
          message.from_me
            ? " bg-purplePrimary"
            : " bg-grayLight border border-stone-300"
        }`}
      >
        <Text
          className={`font-Manrope_400Regular ${
            message.from_me ? "text-white" : "text-black"
          }`}
        >
          {message.content}
        </Text>
      </View>
      {message.from_me || !message.sent_at ? null : (
        <Text className="ml-2 text-xs font-Manrope_500Medium text-grayPrimary">
          {dayjs(message.sent_at).fromNow()}
        </Text>
      )}
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
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </Svg>
);
