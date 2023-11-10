import {
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  Pressable,
  FlatList,
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ChatGroup, Measure, RefAndKey } from "../../../../types/types";
import Colors from "../../../../constants/Colors";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../../../providers/ctx";
import { ApiResponse } from "../../../../types/api";

const TABS = ["Buy", "Sell"];
const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function MessageScreen() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;
  const selectedTabInt = parseInt(selectedTab as string);

  const { session } = useSession();

  const [chats, setChats] = React.useState<ChatGroup[] | undefined>(undefined);
  const {
    isError: isErrorChats,
    isLoading: isLoadingChats,
    refetch,
  } = useQuery({
    queryFn: async () =>
      fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/chats/${
          selectedTabInt ? "seller" : "buyer"
        }`,
        {
          headers: {
            authorization: `Bearer ${session?.token}`,
          },
        }
      ).then((x) => x.json()) as Promise<ApiResponse<ChatGroup[]>>,
    queryKey: ["chats", selectedTabInt],
    enabled: !!session && !!session.token,
    onError(err) {
      console.error("error", err);
    },
    onSuccess(data) {
      // console.log(data);
      if (data.status === "success") {
        setChats(data.data);
      } else {
        console.error(data);
      }
    },
  });

  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Messages
      </Text>
      <Tabs data={data} selectedTabInt={selectedTabInt} />
      {isErrorChats ? (
        <Text className="mx-auto my-[50%] font-Poppins_600SemiBold text-lg">
          Something wrong happened...
        </Text>
      ) : isLoadingChats ? (
        <></>
      ) : chats && chats.length <= 0 ? (
        <>
          <Text className="mx-auto mt-[50%] font-Poppins_600SemiBold text-lg">
            You have no messages.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="border-[1.5px] mt-4 h-[45px] w-[180px] mx-auto flex items-center justify-center"
          >
            <Text className="font-Poppins_500Medium">Refresh</Text>
          </Pressable>
        </>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => <ChatRow chat={item} />}
          keyExtractor={(item) => item.chat_id.toString()}
          onRefresh={() => refetch()}
          refreshing={isLoadingChats}
        />
      )}
    </View>
  );
}

import dayjs from "dayjs";

const ChatRow = ({ chat }: { chat: ChatGroup }) => {
  const width = (Dimensions.get("window").width - 200) / 2;
  return (
    <Pressable
      onPress={() => {
        router.push(`/chat/${chat.item_id}`);
      }}
      className={`flex flex-row py-4 px-4  bg-bgLight border-b border-b-grayPrimary ${
        chat.item_status === "INACTIVE" ? "opacity-70" : ""
      }`}
    >
      <Image
        source={{ uri: chat.item_image }}
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
          <Text className="text-base text-gray-600 font-Manrope_400Regular max-w-[250px]">
            {chat.last_message_content.length >= 50 ? (
              <>{chat.last_message_content.slice(0, 50)}...</>
            ) : (
              chat.last_message_content
            )}
          </Text>
        </View>
        <View className="flex flex-col">
          <Text className="font-Poppins_400Regular">
            {chat.other_user_name}
          </Text>
          <Text className="font-Poppins_400Regular text-sm">
            {chat.item_status === "INACTIVE"
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
      // data: ItemWithImage[];
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
  // itemData: ItemWithImage[];
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
        bottom: -2,
      }}
    />
  );
};
