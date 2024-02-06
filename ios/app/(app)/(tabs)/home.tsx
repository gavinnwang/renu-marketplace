import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { ItemListing } from "../../../components/ItemListing";
import { LogoWithText } from "../../../components/Logo";
import { Item, ItemCategoryWithAll, Measure } from "../../../../shared/types";
import React from "react";
import Colors from "../../../../shared/constants/Colors";
import PagerView from "react-native-pager-view";
import { API_URL, parseOrThrowResponse } from "../../../api";
import { FlashList } from "@shopify/flash-list";
import { useScrollToTop } from "@react-navigation/native";
import { useSession } from "../../../hooks/useSession";

type CategoryTabData = {
  key: string;
  value: string;
  display: string;
  ref: React.RefObject<any>;
  flashListRef: React.RefObject<any>;
};

const data: CategoryTabData[] = Object.keys(ItemCategoryWithAll).map((i) => ({
  key: i,
  value: i,
  display: ItemCategoryWithAll[i],
  ref: React.createRef(),
  flashListRef: React.createRef(),
}));

export default function HomeScreen() {
  const [selectedSection, setSelectedSection] = React.useState(0);
  const pagerViewRef = React.useRef<PagerView>(null);
  const [scrollState, setScrollState] = React.useState(0);
  // const throttledScrollState = useThrottle(scrollState, 50);
  useScrollToTop(data[selectedSection].flashListRef);

  return (
    <View className="bg-bgLight h-full dark:bg-blackPrimary">
      <View className="flex flex-row items-center justify-start pl-4 pr-6 pb-2.5 min-h-[43px]">
        <LogoWithText />
      </View>
      <Tabs
        data={data}
        selectedSection={selectedSection}
        pagerViewRef={pagerViewRef}
        scrollState={scrollState}
      />
      <PagerView
        ref={pagerViewRef}
        // onPageSelected={(e) => {
        //   const idx = e.nativeEvent.position;
        //   setSelectedSection(idx);
        // }}
        onPageScroll={(e) => {
          const { offset, position } = e.nativeEvent;
          setSelectedSection(position);
          setScrollState(offset);
        }}
        className="flex-1"
        initialPage={0}
        orientation="horizontal"
      >
        {data.map((item, index) => (
          <CategoryView
            key={index}
            category={item.value}
            index={index}
            selectedSection={selectedSection}
            flashListRef={item.flashListRef}
          />
        ))}
      </PagerView>
    </View>
  );
}

const CategoryView = ({
  category,
  index,
  selectedSection,
  flashListRef,
}: {
  category: string;
  index: number;
  selectedSection: number;
  flashListRef: React.RefObject<any>;
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);
  const { session } = useSession();
  const getItemsByCategory = async ({ pageParam = 0 }) => {
    console.debug("fetching with pageParam and category", pageParam, category);
    const res = await fetch(
      `${API_URL}/items/?category=${category}&page=${pageParam}`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }
    );
    setFetched(true);
    return parseOrThrowResponse<Item[]>(res);
  };

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
    fetchNextPage,
  } = useInfiniteQuery({
    queryFn: getItemsByCategory,
    queryKey: ["item", category],
    enabled: !fetched && Math.abs(selectedSection - index) <= 2,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined;
    },
  });

  return (
    <View key={index} className="h-full flex flex-grow w-full">
      {isLoadingItems ? (
        <View className="bg-bgLight dark:bg-blackPrimary h-full w-full"></View>
      ) : isErrorItems ? (
        <ScrollView
          className="bg-bgLight dark:bg-blackPrimary h-full py-[70%]"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refetchItems();
                setRefreshing(false);
              }}
            />
          }
        >
          <View className="flex flex-col gap-y-2 items-center">
            <LogoWithText />
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              Something went wrong.
            </Text>
          </View>
        </ScrollView>
      ) : items.pages.length <= 1 && items.pages[0].length === 0 ? (
        <ScrollView
          className="bg-bgLight h-full py-[70%] dark:bg-blackPrimary"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refetchItems();
                setRefreshing(false);
              }}
            />
          }
        >
          <View className="flex flex-col gap-y-2 items-center">
            <LogoWithText />
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary dark:text-bgLight">
              No listings yet. List something!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlashList
          ref={flashListRef}
          className="bg-bgLight h-full dark:bg-blackPrimary"
          showsVerticalScrollIndicator={false}
          estimatedItemSize={320}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refetchItems();
                setRefreshing(false);
              }}
            />
          }
          data={items.pages.flatMap((page) => page)}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 10,
            paddingLeft: 10,
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={ItemListing}
          onEndReached={fetchNextPage}
        />
      )}
    </View>
  );
};

const Tab = React.forwardRef(
  (
    {
      section,
      selectedSection,
      pagerViewRef,
      index,
    }: {
      section: CategoryTabData;
      selectedSection: number;
      pagerViewRef: React.RefObject<PagerView>;
      index: number;
    },
    ref: any
  ) => {
    return (
      <Pressable
        ref={ref}
        key={section.value}
        onPress={() => {
          pagerViewRef.current?.setPage(index);
        }}
        className="px-3 h-full justify-center"
      >
        <Text
          className={`font-Poppins_500Medium ${
            index === selectedSection
              ? "text-purplePrimary"
              : "text-stone-400 dark:text-stone-500"
          }`}
        >
          {section.display}
        </Text>
      </Pressable>
    );
  }
);

const Tabs = ({
  data,
  selectedSection,
  pagerViewRef,
  scrollState,
}: {
  data: CategoryTabData[];
  selectedSection: number;
  pagerViewRef: React.RefObject<PagerView>;
  scrollState: number;
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
  // const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (measures[selectedSection]) {
      Animated.parallel([
        Animated.timing(animatedValueX, {
          toValue:
            measures[selectedSection].x +
            measures[selectedSection].width * scrollState,
          // duration: 100,
          duration: 0,
          useNativeDriver: true,
        }),
        // Animated.timing(animatedWidth, {
        //   toValue: measures[Math.ceil(selectedSection + scrollState)].width,
        //   duration: 50,
        //   useNativeDriver: true,
        // }),
      ]).start();
    }
  }, [selectedSection, measures, scrollState]);

  return (
    <ScrollView
      ref={containerRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border-y border-grayLight dark:border-stone-800 flex flex-row  min-h-[45px] max-h-[42px]"
    >
      {data.map((section, index) => {
        return (
          <Tab
            key={section.key}
            section={section}
            selectedSection={selectedSection + (scrollState > 0.2 ? 1 : 0)}
            ref={section.ref}
            pagerViewRef={pagerViewRef}
            index={index}
          />
        );
      })}

      {measures.length > 0 && (
        <Indicator
          animatedValueX={animatedValueX}
          // animatedWidth={animatedWidth}
          measures={measures}
        />
      )}
    </ScrollView>
  );
};

const Indicator = ({
  animatedValueX,
  // animatedWidth,
  measures,
}: {
  animatedValueX: Animated.Value;
  // animatedWidth: Animated.Value;
  measures: Measure[];
}) => {
  // const max = React.useMemo(
  //   () => Math.max(...measures.map((item) => item.width)) / 2,
  //   [measures]
  // );
  // const scaleX = animatedWidth.interpolate({
  //   inputRange: [0, max],
  //   outputRange: [0, 1],
  // });
  const inputRange = React.useMemo(
    () => measures.map((item) => item.x),
    [measures]
  );
  const outputRangeMemo = React.useMemo(
    () =>
      measures.map((item) => item.x + item.width / 2 - measures[0].width / 2),
    [measures]
  );
  const translateX = animatedValueX.interpolate({
    inputRange: inputRange,
    outputRange: outputRangeMemo,
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        height: 2,
        width: measures[0].width,
        backgroundColor: Colors.northwesternPurple,
        transform: [{ translateX }, { scale: 1.25 }],
        bottom: -4,
      }}
    />
  );
};
