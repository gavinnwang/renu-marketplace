import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { ItemListing } from "../../../components/ItemListing";
import { LogoWithText } from "../../../components/Logo";
import { Item, Measure } from "../../../types";
import React from "react";
import Colors from "../../../../shared/constants/Colors";
import PagerView from "react-native-pager-view";
import { API_URL, parseOrThrowResponse } from "../../../../shared/api";
import { FlashList } from "@shopify/flash-list";
import { useScrollToTop } from "@react-navigation/native";

export const CATEGORIES: Record<string, string> = {
  all: "All",
  womens: "Women's",
  mens: "Men's",
  home: "Home & Tools",
  furniture: "Furniture",
  electronics: "Electronics",
  bikes: "Bikes & Scooters",
  tickets: "Tickets",
  general: "General",
  free: "Free",
};

type CategoryTabData = {
  key: string;
  value: string;
  display: string;
  ref: React.RefObject<any>;
  flashListRef: React.RefObject<any>;
};

const data: CategoryTabData[] = Object.keys(CATEGORIES).map((i) => ({
  key: i,
  value: i,
  display: CATEGORIES[i],
  ref: React.createRef(),
  flashListRef: React.createRef(),
}));

export default function HomeScreen() {
  const [selectedSection, setSelectedSection] = React.useState(0);
  const pagerViewRef = React.useRef<PagerView>(null);

  useScrollToTop(data[selectedSection].flashListRef);

  return (
    <View className="bg-bgLight h-full">
      <View className="flex flex-row items-center justify-start pl-4 pr-6 pb-2.5 min-h-[43px]">
        <LogoWithText />
      </View>
      <Tabs
        data={data}
        selectedSection={selectedSection}
        pagerViewRef={pagerViewRef}
      />
      <PagerView
        ref={pagerViewRef}
        onPageScroll={(e) => {
          const idx = e.nativeEvent.position;
          setSelectedSection(idx);
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
  const getItemsByCategory = async ({ pageParam = 0 }) => {
    console.debug("fetching with pageParam and category", pageParam, category);
    const res = await fetch(
      `${API_URL}/items/?category=${category}&page=${pageParam}`
    );
    return parseOrThrowResponse<Item[]>(res);
  };

  const [refreshing, setRefreshing] = React.useState(false);
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryFn: getItemsByCategory,
    queryKey: ["item", category],
    // enabled: Math.abs(selectedSection - index) <= 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined;
    },
  });

  return (
    <View key={index} className="h-full flex flex-grow">
      {isLoadingItems ? (
        <View className="bg-bgLight h-full w-full"></View>
      ) : isErrorItems ? (
        <ScrollView
          className="bg-bgLight h-full py-[70%]"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchItems();
              }}
            />
          }
        >
          <View className="flex flex-col gap-y-2 items-center">
            <LogoWithText />
            <Text className="font-Poppins_600SemiBold text-lg">
              Something went wrong.
            </Text>
          </View>
        </ScrollView>
      ) : items.pages.length <= 1 && items.pages[0].length === 0 ? (
        <ScrollView
          className="bg-bgLight h-full py-[70%]"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetchItems} />
          }
        >
          <View className="flex flex-col gap-y-2 items-center">
            <LogoWithText />
            <Text className="font-Poppins_600SemiBold text-lg">
              No item right now... List one!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlashList
          ref={flashListRef}
          className="bg-bgLight h-full"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchItems();
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
          onEndReached={() => {
            fetchNextPage();
          }}
          estimatedItemSize={320}
          removeClippedSubviews={true}
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
            index === selectedSection ? "text-purplePrimary" : "text-gray-400"
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
}: {
  data: CategoryTabData[];
  selectedSection: number;
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
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // const idx = data.findIndex((item) => item.value === selectedSection);
    if (measures[selectedSection]) {
      Animated.parallel([
        Animated.timing(animatedValueX, {
          toValue: measures[selectedSection].x,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedWidth, {
          toValue: measures[selectedSection].width,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedSection, measures]);

  return (
    <ScrollView
      ref={containerRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border-y border-grayLight flex flex-row  min-h-[45px] max-h-[42px]"
    >
      {data.map((section, index) => {
        return (
          <Tab
            key={section.key}
            section={section}
            selectedSection={selectedSection}
            ref={section.ref}
            pagerViewRef={pagerViewRef}
            index={index}
          />
        );
      })}

      {measures.length > 0 && (
        <Indicator
          animatedValueX={animatedValueX}
          animatedWidth={animatedWidth}
          measures={measures}
        />
      )}
    </ScrollView>
  );
};

const Indicator = ({
  animatedValueX,
  animatedWidth,
  measures,
}: {
  animatedValueX: Animated.Value;
  animatedWidth: Animated.Value;
  measures: Measure[];
}) => {
  const scaleX = animatedWidth.interpolate({
    inputRange: [0, Math.max(...measures.map((item) => item.width)) / 3],
    outputRange: [0, 1],
  });
  const translateX = animatedValueX.interpolate({
    inputRange: measures.map((item) => item.x),
    outputRange: measures.map(
      (item) => item.x + item.width / 2 - measures[0].width / 2
    ),
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        height: 2,
        width: measures[0].width,

        backgroundColor: Colors.northwesternPurple,
        transform: [{ translateX }, { scaleX }],
        bottom: -4,
      }}
    />
  );
};
