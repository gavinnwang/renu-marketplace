import { router, useLocalSearchParams } from "expo-router";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { useState } from "react";
import { ApiResponse } from "../../../types/api";
import { ItemListing } from "../../../components/ItemListing";
import { LogoWithText } from "../../../components/Logo";
import { ItemWithImage, Measure, RefAndKey } from "../../../types/types";
import React from "react";
import Colors from "../../../constants/Colors";
import PagerView from "react-native-pager-view";

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
};

const data: CategoryTabData[] = Object.keys(CATEGORIES).map((i) => ({
  key: i,
  value: i,
  display: CATEGORIES[i],
  ref: React.createRef(),
}));

// const MagnifyingGlassIcon = () => (
//   <Svg width="18" height="18" viewBox="0 0 14 14" fill="none">
//     <Path
//       d="M13 13L9 9M1 5.66667C1 6.2795 1.12071 6.88634 1.35523 7.45252C1.58975 8.01871 1.93349 8.53316 2.36683 8.9665C2.80018 9.39984 3.31462 9.74358 3.88081 9.97811C4.447 10.2126 5.05383 10.3333 5.66667 10.3333C6.2795 10.3333 6.88634 10.2126 7.45252 9.97811C8.01871 9.74358 8.53316 9.39984 8.9665 8.9665C9.39984 8.53316 9.74358 8.01871 9.97811 7.45252C10.2126 6.88634 10.3333 6.2795 10.3333 5.66667C10.3333 5.05383 10.2126 4.447 9.97811 3.88081C9.74358 3.31462 9.39984 2.80018 8.9665 2.36683C8.53316 1.93349 8.01871 1.58975 7.45252 1.35523C6.88634 1.12071 6.2795 1 5.66667 1C5.05383 1 4.447 1.12071 3.88081 1.35523C3.31462 1.58975 2.80018 1.93349 2.36683 2.36683C1.93349 2.80018 1.58975 3.31462 1.35523 3.88081C1.12071 4.447 1 5.05383 1 5.66667Z"
//       stroke={Colors.grayPrimary}
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </Svg>
// );
const pagerViewRef = React.useRef<PagerView>(null);

export default function HomePage() {
  // const param = useLocalSearchParams();
  // const selectedSection = param.section as string;
  const [selectedSection, setSelectedSection] = useState("all");
  return (
    <View className="bg-bgLight h-full">
      <View className="flex flex-row items-center justify-start pl-4 pr-6 pb-2.5 min-h-[43px]">
        <LogoWithText />
        {/* <View className="flex justify-center bg-grayLight items-center rounded-md flex-grow ml-2.5">
          <TextInput placeholder="Search here" className="p-2.5 w-full" />
        </View> */}
        {/* <MagnifyingGlassIc150on /> */}
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
          const section = data[idx].value;
          if (section === selectedSection) {
            return;
          }
          // void router.replace(`/home/${section}`);
          setSelectedSection(section);
        }}
        className="flex-1"
        initialPage={0}
        orientation="horizontal"
      >
        {data.map((item, index) => (
          <CategoryView key={index} category={item.value} index={index} />
        ))}
      </PagerView>
    </View>
  );
}

const CategoryView = ({
  category,
  index,
}: {
  category: string;
  index: number;
}) => {
  const fetchUrlPath =
    category == "all" ? "/items/" : `/items/category/${category}`;
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${fetchUrlPath}`).then((x) =>
        x.json()
      ) as Promise<ApiResponse<ItemWithImage[]>>,
    queryKey: ["item", category],
  });

  const [refreshing, _] = useState(false);

  return (
    <View key={index} className="h-full flex flex-grow">
      {isLoadingItems ? (
        <></>
      ) : isErrorItems ? (
        <ScrollView
          className="bg-grayLight h-full py-[70%]"
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
              Something went wrong. Please try again later.
            </Text>
          </View>
        </ScrollView>
      ) : items.data.length === 0 ? (
        <ScrollView
          className="bg-grayLight h-full py-[70%]"
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
              No item right now... List one!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          className="bg-grayLight h-full"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchItems();
              }}
            />
          }
          data={items.data}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginTop: 12,
            paddingHorizontal: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 92,
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={ItemListing}
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
      selectedSection: string;
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
            section.value === selectedSection
              ? "text-purplePrimary"
              : "text-gray-400"
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
  selectedSection: string;
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
    const idx = data.findIndex((item) => item.value === selectedSection);
    if (measures[idx]) {
      Animated.parallel([
        Animated.timing(animatedValueX, {
          toValue: measures[idx].x,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedWidth, {
          toValue: measures[idx].width,
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
    ></Animated.View>
  );
};
