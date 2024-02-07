import {
  Text,
  View,
  Dimensions,
  Animated,
  Pressable,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { ChatGroup, Measure, RefAndKey } from "../../../../shared/types";
import Colors from "../../../../shared/constants/Colors";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useSession } from "../../../hooks/useSession";
import { IMAGES_URL, getAllChatGroups } from "../../../api";
import { FlashList } from "@shopify/flash-list";
import RefreshScreen from "../../../components/RefreshScreen";
import PagerView from "react-native-pager-view";

const TABS = ["Buy", "Sell"];
const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function MessagePage() {
  const pagerViewRef = React.useRef<PagerView>(null);
  const [selectedTabInt, setSelectedTabInt] = React.useState(0);

  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <Text className="m-2.5 mt-2 font-Poppins_600SemiBold text-xl text-blackPrimary dark:text-bgLight">
        Messages
      </Text>
      <Tabs
        data={data}
        selectedTabInt={selectedTabInt}
        // chats={chats}
        pagerViewRef={pagerViewRef}
      />
      <PagerView
        onPageSelected={(e) => {
          const idx = e.nativeEvent.position;
          setSelectedTabInt(idx);
        }}
        className="flex-1"
        initialPage={0}
        orientation="horizontal"
        ref={pagerViewRef}
      >
        {data.map((_, index) => (
          <TabPage index={index} key={index} />
        ))}
      </PagerView>
    </View>
  );
}

function TabPage({ index }: { index: number }) {
  const { session } = useSession();

  const [refreshing, setRefreshing] = React.useState(false);

  const queryClient = useQueryClient();
  const {
    data: allChats,
    isError: isErrorChats,
    isLoading: isLoadingChats,
    refetch,
  } = useQuery({
    queryFn: () => getAllChatGroups(session!.token!),
    queryKey: ["chats"],
    enabled: !!session && session.is_guest === false && !!session.token,
  });

  const chats = index === 0 ? allChats?.buyer_chat : allChats?.seller_chat;

  const { setSession } = useSession();
  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      {session?.is_guest ? (
        <View className="flex-grow flex flex-col mt-[220px] items-center w-full">
          <Text className="font-Poppins_600SemiBold text-base text-center text-blackPrimary dark:text-bgLight mx-5">
            You must be logged in to view your messages.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSession(null);
              router.replace("/login");
            }}
            className="border-[1.5px] border-blackPrimary dark:border-bgLight mt-4 h-[40px] w-[160px] mx-auto flex items-center justify-center rounded-sm"
          >
            <Text className="font-Poppins_600SemiBold text-blackPrimary dark:text-bgLight">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      ) : isErrorChats ? (
        <RefreshScreen displayText="Something went wrong." refetch={refetch} />
      ) : isLoadingChats ? (
        <></>
      ) : chats && chats.length === 0 ? (
        <RefreshScreen displayText="No messages yet." refetch={refetch} />
      ) : (
        <FlashList
          data={chats}
          renderItem={({ item }) => (
            <ChatRow item={item} sellOrBuy={TABS[index]} />
          )}
          keyExtractor={(item) => item.chat_id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refetch();
                // await queryClient.invalidateQueries(["unreadCount"]);
                setRefreshing(false);
              }}
            />
          }
          estimatedItemSize={160}
        />
      )}
    </View>
  );
}

const ChatRow = ({
  item: chat,
  sellOrBuy,
}: {
  item: ChatGroup;
  sellOrBuy: string;
}) => {
  const width = (Dimensions.get("window").width - 230) / 2;
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: `/chat/${chat.item_id}`,
          params: {
            chatIdParam: chat.chat_id,
            sellOrBuy,
            otherUserName: chat.other_user_name,
            unreadCount: chat.unread_count,
          },
        });
      }}
      className={`flex flex-row py-4 px-4  bg-bgLight border-b border-b-zinc-300 dark:border-b-zinc-600 dark:bg-blackPrimary ${
        chat.item_status === "inactive" ? "opacity-70" : ""
      }`}
    >
      <View className="relative">
        <Image
          transition={{
            effect: "cross-dissolve",
            duration: 50,
          }}
          source={{ uri: `${IMAGES_URL}${chat.item_images[0]}` }}
          className="object-cover rounded-sm"
          style={{
            width: width,
            maxWidth: width,
            height: (width * 4) / 3,
            backgroundColor:
              colorScheme === "dark" ? Colors.blackPrimary : Colors.grayLight,
          }}
        />
        {chat.unread_count > 0 && (
          <View className="flex items-center rounded-full justify-center h-6 w-6 absolute bg-purplePrimary -right-2 -top-2">
            <Text className="text-white font-Manrope_600SemiBold">
              {chat.unread_count}
            </Text>
          </View>
        )}
      </View>
      <View className="flex flex-col px-4 flex-grow justify-between">
        <View>
          <View className="flex flex-row gap-y-1 justify-between max-w-[250px]">
            <Text className="font-Manrope_600SemiBold text-base max-h-[50px] text-blackPrimary dark:text-bgLight">
              {chat.item_name}
            </Text>
          </View>
          {chat.last_message_content && (
            <Text className="text-base text-gray-600 font-Manrope_500Medium max-w-[250px] dark:text-gray-400">
              {chat.last_message_content.length >= 50 ? (
                <>{chat.last_message_content.slice(0, 50)}...</>
              ) : (
                chat.last_message_content
              )}
            </Text>
          )}
        </View>
        <View className="flex flex-col">
          <Text className="font-Manrope_500Medium text-xs text-blackPrimary dark:text-bgLight">
            {chat.other_user_name}
            {"    "}
            {dayjs(chat.last_message_sent_at).fromNow()}
          </Text>
          <Text className="font-Manrope_600SemiBold text-sm text-purplePrimary dark:text-purple-300">
            {chat.item_status === "inactive"
              ? "Item is no longer available."
              : ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const Tab = React.forwardRef(
  (
    {
      index,
      selectedTabInt,
      pagerViewRef,
    }: {
      index: number;
      selectedTabInt: number;
      pagerViewRef: React.RefObject<PagerView>;
    },
    ref: any
  ) => {
    const { session } = useSession();
    const { data: allChats } = useQuery({
      queryFn: () => getAllChatGroups(session!.token!),
      queryKey: ["chats"],
      enabled: !!session && session.is_guest === false && !!session.token,
    });
    const chats = index === 0 ? allChats?.buyer_chat : allChats?.seller_chat;
    const unreadCount = React.useMemo(() => {
      return chats?.filter((c) => c.unread_count > 0).length ?? 0;
    }, [chats]);
    return (
      <Pressable
        key={index}
        onPress={() => {
          pagerViewRef.current?.setPage(index);
        }}
        className="w-[50%] justify-center items-center"
        ref={ref}
      >
        <Text
          className={`ml-2.5 mt-2 font-Poppins_600SemiBold text-base font-semibold leading-7 ${
            selectedTabInt === index
              ? "text-blackPrimary border-b-grayLight dark:text-bgLight"
              : "text-grayPrimary"
          }`}
        >
          {TABS[index]}{" "}
          <Text className="font-Poppins_500Medium text-sm">
            ({unreadCount})
          </Text>
        </Text>
      </Pressable>
    );
  }
);

const Tabs = ({
  data,
  selectedTabInt,
  // chats,
  pagerViewRef,
}: {
  data: RefAndKey[];
  selectedTabInt: number;
  // chats: ChatGroup[] | undefined;
  pagerViewRef: React.RefObject<PagerView>;
}) => {
  const [measures, setMeasures] = React.useState<Measure[]>([]);
  const containerRef = React.useRef<any>();
  React.useEffect(() => {
    let m: Measure[] = [];
    data.forEach((item) => {
      item.ref.current.measureLayout(
        containerRef.current,
        (x: number, y: number, width: number, height: number) => {
          m.push({
            x,
            y,
            width,
            height,
          });
          if (m.length === data.length) {
            setMeasures(m);
          }
        }
      );
    });
  }, [containerRef.current]);

  const animatedValueX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (measures[selectedTabInt]) {
      Animated.parallel([
        Animated.timing(animatedValueX, {
          toValue: measures[selectedTabInt].x,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedTabInt, measures]);

  return (
    <View
      ref={containerRef}
      className="flex flex-row  w-screen justify-center items-center border-b border-b-grayLight dark:border-b-blackSecondary"
    >
      {data.map((section, index) => {
        return (
          <Tab
            pagerViewRef={pagerViewRef}
            key={section.key}
            index={index}
            ref={section.ref}
            selectedTabInt={selectedTabInt}
          />
        );
      })}

      {measures.length > 0 && (
        <Indicator animatedValueX={animatedValueX} measures={measures} />
      )}
    </View>
  );
};

const Indicator = ({
  animatedValueX,
  measures,
}: {
  animatedValueX: Animated.Value;
  measures: Measure[];
}) => {
  const translateX = animatedValueX.interpolate({
    inputRange: measures.map((item) => item.x),
    outputRange: measures.map(
      (item) => item.x - (Dimensions.get("window").width / 2 - item.width / 2)
    ),
  });

  return (
    <Animated.View
      className="bg-blackPrimary dark:bg-bgLight"
      style={{
        position: "absolute",
        height: 2,
        width: Dimensions.get("window").width / 2,
        borderRadius: 1,
        transform: [{ translateX }],
        bottom: -1,
      }}
    />
  );
};
