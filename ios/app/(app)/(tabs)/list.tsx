import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Colors from "../../../../shared/constants/Colors";
import {
  Item,
  ItemCategoryWithAll as ItemCategory,
  Measure,
  RefAndKey,
} from "../../../../shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";

const TABS = ["Active", "Sold"];
const STATUS = ["active", "inactive"];

const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function ListPage() {
  const pagerViewRef = React.useRef<PagerView>(null);
  const [selectedTabInt, setSelectedTabInt] = React.useState(0);

  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <Text className="m-2.5 mt-2 font-Poppins_600SemiBold text-xl text-blackPrimary dark:text-bgLight">
        Listings
      </Text>
      <Tabs
        data={data}
        selectedTabInt={selectedTabInt}
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

      <View className="h-[72px] w-full bg-bgLight dark:bg-blackPrimary border-t border-t-stone-200 dark:border-t-stone-800 py-3 px-6 flex items-center justify-center">
        <Pressable
          onPress={() => {
            void router.push({
              pathname: "/upload-listing",
            });
          }}
          className="w-full h-full bg-purplePrimary rounded-sm flex shadow-lg items-center justify-center"
        >
          <Text className="font-SecularOne_400Regular text-xl text-white">
            ADD NEW LISTING
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TabPage({ index }: { index: number }) {
  const tabDisplay = TABS[index];

  const { session , setSession} = useSession();
  const {
    data: items,
    isError: isErrorItem,
    isLoading: isLoadingItem,
    refetch,
  } = useQuery({
    queryKey: ["list"],
    queryFn: () => getUserMeItems(session!.token!),
    enabled: !!session && !!session.token && session.is_guest === false,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  return (
    <View className="bg-bgLight dark:bg-blackPrimary h-full">
      {session?.is_guest ? (
        <View className="flex-grow flex flex-col justify-center items-center w-full">
          <Text className="font-Poppins_600SemiBold text-base text-center text-blackPrimary dark:text-bgLight">
            You must be logged in to view your listings.
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
      ) : isErrorItem ? (
        <RefreshScreen
          displayText={"Something went wrong."}
          refetch={refetch}
        />
      ) : isLoadingItem ? (
        <View className="flex flex-grow"></View>
      ) : items.filter((item) => item.status === STATUS[index]).length > 0 ? (
        <FlashList
          estimatedItemSize={160}
          data={items.filter((item) => item.status === STATUS[index])}
          numColumns={1}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refetch();
                setRefreshing(false);
              }}
            />
          }
          renderItem={(object) => <ListingPageItem item={object.item} />}
        />
      ) : (
        <RefreshScreen
          displayText={`You have no ${tabDisplay} items.`}
          refetch={refetch}
        />
      )}
    </View>
  );
}

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { FlashList } from "@shopify/flash-list";
import { useSession } from "../../../hooks/useSession";
import { IMAGES_URL, getUserMeItems, postItemStatus } from "../../../api";
import RefreshScreen from "../../../components/RefreshScreen";
import PagerView from "react-native-pager-view";

const ListingPageItem = ({ item }: { item: Item }) => {
  const width = (Dimensions.get("window").width - 210) / 2;
  const { session } = useSession();

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newStatus: string) => postItemStatus(session!.token!, item.id, newStatus),
    {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ["list"] });
        const previousState = queryClient.getQueryData(["list"]);

        // Optimistically update to the new value
        queryClient.setQueryData(["list"], (oldData: any) => {
          if (!oldData) {
            return [];
          }
          return oldData.map((i: Item) => {
            if (i.id === item.id) {
              return {
                ...i,
                status: item.status === "active" ? "inactive" : "active",
              };
            }
            return i;
          });
        });

        return { previousState };
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, _, context: any) => {
        console.error(err);
        queryClient.setQueryData(["list"], context.previousState);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["list"]);
      },
    }
  );
  const onPressHandler = () => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    mutation.mutateAsync(newStatus);
  };

  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={() => {
        console.debug(item);
        void router.push({
          pathname: `/item/${item.id}`,
          params: {
            itemString: JSON.stringify(item).replace(/%/g, "~~pct~~"),
          },
        });
      }}
      className="flex flex-row py-4 px-4 border-b border-b-zinc-300 dark:border-b-zinc-600"
    >
      <Image
        source={{ uri: `${IMAGES_URL}${item.images[0]}` }}
        transition={{
          effect: "cross-dissolve",
          duration: 100,
        }}
        recyclingKey={item.id.toString()}
        className="object-cover rounded-sm"
        style={{
          width: width,
          maxWidth: width,
          height: (width * 4) / 3,
          backgroundColor:
            colorScheme === "dark" ? Colors.blackPrimary : Colors.grayLight,
        }}
      />
      <View className="flex flex-col flex-grow justify-between px-4">
        <View className="flex flex-col flex-grow gap-y-1">
          <Text className="font-Manrope_600SemiBold text-base max-h-[25px] text-blackPrimary dark:text-bgLight">
            {item.name}
          </Text>
          <Text className="font-Manrope_400Regular text-sm text-blackPrimary dark:text-bgLight">
            {dayjs(item.created_at).fromNow()}
          </Text>
          <Text className="font-Manrope_400Regular text-sm text-blackPrimary dark:text-bgLight">
            {ItemCategory[item.category]}{" "}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onPressHandler}
          className="border-[1.5px] h-[32px] w-[250px] flex items-center justify-center rounded-sm border-blackPrimary dark:border-stone-300"
        >
          <Text className="font-SecularOne_400Regular text-sm text-blackPrimary dark:text-stone-300">
            {item.status === "active" ? "MARK AS SOLD" : "RELIST"}
          </Text>
        </TouchableOpacity>
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
      pagerViewRef,
    }: {
      selectedTabInt: number;
      sectionIndex: number;
      dataCount: number;
      pagerViewRef: React.RefObject<PagerView>;
    },
    ref: any
  ) => {
    return (
      <Pressable
        key={sectionIndex}
        onPress={() => {
          pagerViewRef.current?.setPage(sectionIndex);
        }}
        className="w-[50%] justify-center items-center"
        ref={ref}
      >
        <View>
          <Text
            className={`ml-2.5 mt-2 font-Poppins_600SemiBold text-base font-semibold leading-7 ${
              sectionIndex === selectedTabInt
                ? "text-blackPrimary dark:text-bgLight border-grayPrimary"
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
  pagerViewRef,
}: {
  data: RefAndKey[];
  selectedTabInt: number;
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

  const { session } = useSession();
  const { data: itemData } = useQuery({
    queryKey: ["list"],
    queryFn: () => getUserMeItems(session!.token!),
    enabled: !!session && !!session.token && session.is_guest === false,
  });

  return (
    <View
      ref={containerRef}
      className="flex flex-row  w-screen justify-center items-center border-b border-b-grayLight dark:border-b-blackSecondary"
    >
      {data.map((section, i) => {
        return (
          <Tab
            pagerViewRef={pagerViewRef}
            key={section.key}
            selectedTabInt={selectedTabInt}
            sectionIndex={i}
            ref={section.ref}
            dataCount={
              itemData?.filter((item) => item.status === STATUS[i]).length ?? 0
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
      className="bg-blackPrimary dark:bg-bgLight"
      style={{
        position: "absolute",
        height: 2,
        width: Dimensions.get("window").width / 2,
        transform: [{ translateX }],
        bottom: -1,
      }}
    />
  );
};
