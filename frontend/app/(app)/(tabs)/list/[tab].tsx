import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Colors from "../../../../constants/Colors";
import { Item, Measure, RefAndKey } from "../../../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Image } from "expo-image";

const TABS = ["Listings", "Sold"];
const STATUS = ["active", "inactive"];

const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function ListScreen() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;
  const selectedTabInt = parseInt(selectedTab as string);
  const tabDisplay = TABS[selectedTabInt];

  const { session } = useSession();

  const {
    data: items,
    isError: isErrorItem,
    isLoading: isLoadingItem,
    refetch,
  } = useQuery({
    queryKey: ["list"],
    queryFn: () => getUserMeItems(session!.token),
    enabled: !!session && !!session.token,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        {tabDisplay}
      </Text>
      <Tabs
        data={data}
        selectedTabInt={selectedTabInt}
        itemData={items ?? []}
      />
      {isErrorItem ? (
        <View className="flex flex-grow">
          <Text className=" mx-auto mt-[50%] font-Poppins_600SemiBold text-lg">
            Something went wrong.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="border-[1.5px] mt-4 h-[45px] w-[180px] mx-auto flex items-center justify-center"
          >
            <Text className="font-Poppins_500Medium">Refresh</Text>
          </Pressable>
        </View>
      ) : isLoadingItem ? (
        <View className="flex flex-grow"></View>
      ) : items.filter((item) => item.status === STATUS[selectedTabInt])
          .length > 0 ? (
        <FlashList
          estimatedItemSize={items.length}
          data={items.filter((item) => item.status === STATUS[selectedTabInt])}
          numColumns={1}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetch();
              }}
            />
          }
          renderItem={(object) => (
            <ListingPageItem
              item={object.item}
              token={session?.token}
              refetch={refetch}
            />
          )}
        />
      ) : (
        <View className="flex flex-grow">
          <Text className=" mx-auto mt-[50%] font-Poppins_600SemiBold text-lg">
            You have no {tabDisplay ? "sold items." : "listings."}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="border-[1.5px] mt-4 h-[45px] w-[180px] mx-auto flex items-center justify-center"
          >
            <Text className="font-Poppins_500Medium">Refresh</Text>
          </Pressable>
        </View>
      )}

      <View className="h-[72px] w-full bg-bgLight border-t border-t-stone-200 py-3 px-6 flex items-center justify-center">
        <Pressable
          onPress={() => {
            void router.push({
              pathname: "/upload-listing-step-one",
            });
          }}
          className="w-full h-full bg-purplePrimary flex shadow-lg items-center justify-center"
        >
          <Text className="font-SecularOne_400Regular text-xl text-white">
            ADD NEW LISTING
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { CATEGORIES } from "../home";
import { FlashList } from "@shopify/flash-list";
import { useSession } from "../../../../hooks/useSession";
import { getUserMeItems } from "../../../../api";

const ListingPageItem = ({
  item,
  token,
  refetch,
}: {
  item: Item;
  token: string | undefined;
  refetch: any;
}) => {
  const width = (Dimensions.get("window").width - 200) / 2;
  const [isSold, setIsSold] = React.useState<boolean>(false);

  const queryClient = useQueryClient();
  const [touching, setTouching] = React.useState(false);
  return (
    <Pressable
      onPressIn={() => {
        setTouching(true);
      }}
      onPressOut={() => {
        setTouching(false);
      }}
      onPress={() => {
        void router.push({ pathname: `/item/${item.id}` });
      }}
      className={`flex flex-row py-4 px-4 border-b border-b-grayPrimary  ${
        touching ? "bg-gray-100" : ""
      }`}
    >
      <Image
        source={{ uri: item.images[0] }}
        transition={{
          effect: "cross-dissolve",
          duration: 300,
        }}
        placeholder={"TCLqY200RSDlM{_24o4n-:~p?b9F"}
        className="object-cover rounded-sm"
        style={{
          width: width,
          maxWidth: width,
          height: (width * 4) / 3,
        }}
      />
      <View className="flex flex-col flex-grow justify-between px-4 pt-2">
        <View className="flex flex-col flex-grow gap-y-1">
          <Text className="font-Manrope_600SemiBold text-base">
            {item.name}
          </Text>
          <Text className="font-Manrope_400Regular text-sm">
            {dayjs(item.created_at).fromNow()}
          </Text>
          <Text className="font-Manrope_400Regular text-sm">
            {CATEGORIES[item.category]}{" "}
          </Text>
        </View>
        <Pressable
          onPressIn={() => {
            setIsSold(true);
          }}
          onPressOut={() => {
            setIsSold(false);
          }}
          onPress={() => {
            fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/items/${item.id}`, {
              method: "POST",
              headers: {
                authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: item.status === "active" ? "inactive" : "active",
              }),
            }).then(() => {
              refetch();
              queryClient.invalidateQueries(["me"]); // revalidate account because num of listing or sold items changed
            });
          }}
          className="border-[1.5px] h-[35px] flex-grow-0 flex items-center justify-center"
        >
          <Text
            className={`font-SecularOne_400Regular text-sm ${
              isSold ? "text-gray-500" : "text-blackPrimary"
            }`}
          >
            {item.status === "active" ? "MARK AS SOLD" : "RELIST"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const Tab = React.forwardRef(
  (
    {
      selectedTabInt,
      sectionIndex,
      dataCount,
    }: {
      selectedTabInt: number;
      sectionIndex: number;
      dataCount: number;
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
          void router.replace(`/list/${sectionIndex}`);
        }}
        className="w-[50%] justify-center items-center"
        ref={ref}
      >
        <View>
          <Text
            className={`ml-2.5 mt-6 font-Poppins_600SemiBold text-base font-semibold leading-7 ${
              sectionIndex === selectedTabInt
                ? "text-blackPrimary border-b border-grayPrimary"
                : "text-grayPrimary"
            }`}
          >
            {TABS[sectionIndex]}{" "}
            <Text className="font-Poppins_500Medium text-sm">
              ({dataCount})
            </Text>
          </Text>
        </View>
      </Pressable>
    );
  }
);

const Tabs = ({
  data,
  selectedTabInt,
  itemData,
}: {
  data: RefAndKey[];
  selectedTabInt: number;
  itemData: Item[];
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
            dataCount={
              itemData.filter((item) => item.status === STATUS[i]).length
            }
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
