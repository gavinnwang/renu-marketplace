import {
  Text,
  View,
  Dimensions,
  Animated,
  Pressable,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChatGroup, Measure, RefAndKey } from "../../../../types";
import Colors from "../../../../constants/Colors";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useSession } from "../../../../hooks/useSession";
import { getChatGroups } from "../../../../api";
import { FlashList } from "@shopify/flash-list";
import RefreshScreen from "../../../../components/RefreshScreen";

const TABS = ["Buy", "Sell"];
const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function MessageScreen() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab as string;
  const selectedTabInt = parseInt(selectedTab);

  const { session } = useSession();

  const {
    data: chats,
    isError: isErrorChats,
    isLoading: isLoadingChats,
    refetch,
  } = useQuery({
    queryFn: () =>
      getChatGroups(session!.token, selectedTabInt ? "seller" : "buyer"),
    queryKey: ["chats", TABS[selectedTabInt]],
    enabled: !!session,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Messages
      </Text>
      <Tabs data={data} selectedTabInt={selectedTabInt} />
      {isErrorChats ? (
        <RefreshScreen displayText="Something went wrong." refetch={refetch} />
      ) : isLoadingChats ? (
        <></>
      ) : chats.length === 0 ? (
        <RefreshScreen displayText="No messages yet." refetch={refetch} />
      ) : (
        <FlashList
          data={chats}
          renderItem={({ item }) => <ChatRow item={item} />}
          keyExtractor={(item) => item.chat_id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetch();
              }}
            />
          }
          estimatedItemSize={160}
        />
      )}
    </View>
  );
}

const ChatRow = ({ item: chat }: { item: ChatGroup }) => {
  const width = (Dimensions.get("window").width - 200) / 2;
  const param = useLocalSearchParams();
  const selectedTabInt = parseInt(param.tab as string);

  const [touching, setTouching] = React.useState(false);

  return (
    <Pressable
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onPress={() => {
        router.push({
          pathname: `/chat/${chat.item_id}`,
          params: {
            chatIdParam: chat.chat_id,
            sellOrBuy: TABS[selectedTabInt],
            otherUserName: chat.other_user_name,
          },
        });
      }}
      className={`flex flex-row py-4 px-4  bg-bgLight border-b border-b-grayPrimary ${
        chat.item_status === "inactive" ? "opacity-70" : ""
      } ${touching ? "bg-gray-100" : ""}`}
    >
      <Image
        transition={{
          effect: "cross-dissolve",
          duration: 250,
        }}
        placeholder={"TCLqY200RSDlM{_24o4n-:~p?b9F"}
        source={{ uri: chat.item_images[0] }}
        className="object-cover rounded-sm"
        style={{
          width: width,
          maxWidth: width,
          height: (width * 4) / 3,
        }}
      />
      <View className="flex flex-col px-4 pt-2 flex-grow justify-between ">
        <View>
          <View className="flex flex-row gap-y-1 justify-between">
            <Text className="font-Manrope_600SemiBold text-base">
              {chat.item_name}
            </Text>
            <Text className="font-Manrope_400Regular text-sm">
              {dayjs(chat.last_message_sent_at).fromNow()}
            </Text>
          </View>
          {chat.last_message_content && (
            <Text className="text-base text-gray-600 font-Manrope_400Regular max-w-[250px]">
              {chat.last_message_content.length >= 50 ? (
                <>{chat.last_message_content.slice(0, 50)}...</>
              ) : (
                chat.last_message_content
              )}
            </Text>
          )}
        </View>
        <View className="flex flex-col">
          <Text className="font-Poppins_400Regular">
            {chat.other_user_name}
          </Text>
          <Text className="font-Manrope_600SemiBold text-sm text-purplePrimary">
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
      selectedTabInt,
      sectionIndex,
    }: // data,
    {
      selectedTabInt: number;
      sectionIndex: number;
      // data: Item[];
    },
    ref: any
  ) => {
    return (
      <Pressable
        key={sectionIndex}
        onPress={() => {
          if (selectedTabInt === sectionIndex) {
            return;
          }
          void router.replace(`/message/${sectionIndex}`);
        }}
        className="w-[50%] justify-center items-center"
        ref={ref}
      >
        <View>
          <Text
            className={`ml-2.5 mt-6 font-Poppins_600SemiBold text-base font-semibold leading-7 ${
              sectionIndex === selectedTabInt
                ? "text-blackPrimary border-b-[1px] border-b-grayLight"
                : "text-grayPrimary"
            }`}
          >
            {TABS[sectionIndex]}
          </Text>
        </View>
      </Pressable>
    );
  }
);

const Tabs = ({
  data,
  selectedTabInt,
}: // itemData,
{
  data: RefAndKey[];
  selectedTabInt: number;
  // itemData: Item[];
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
      className="flex flex-row  w-screen justify-center items-center border-b border-b-grayLight"
    >
      {data.map((section, i) => {
        return (
          <Tab
            key={section.key}
            selectedTabInt={selectedTabInt}
            sectionIndex={i}
            ref={section.ref}
            // data={itemData}
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
      style={{
        position: "absolute",
        height: 2,
        width: Dimensions.get("window").width / 2,
        backgroundColor: Colors.blackPrimary,
        transform: [{ translateX }],
        bottom: -1,
      }}
    />
  );
};
