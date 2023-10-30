import { router, useLocalSearchParams } from "expo-router";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RefreshControl } from "react-native-gesture-handler";
import { useState } from "react";
import { ApiResponse } from "../../../../types/api";
import { ItemListing } from "../../../../components/ItemListing";
import { LogoWithText } from "../../../../components/Logo";
import { ItemWithImage } from "../../../../types/types";
import React from "react";
import Colors from "../../../../constants/Colors";

type Section = {
  display: string;
  value: string;
};

type SectionWithRefAndKey = Section & {
  key: string;
  ref: React.RefObject<any>;
};

type Measure = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const SECTIONS: Section[] = [
  { display: "All", value: "all" },
  { display: "Women's", value: "womens" },
  { display: "Men's", value: "mens" },
  { display: "Home & Tools", value: "home" },
  { display: "Furniture", value: "furniture" },
  { display: "Electronics", value: "electronics" },
  { display: "Bikes & Scooters", value: "bikes" },
  { display: "Tickets", value: "tickets" },
  { display: "General", value: "general" },
  { display: "Free", value: "free" },
];

const data = Object.entries(SECTIONS).map((i) => ({
  key: i[0],
  display: i[1].display,
  value: i[1].value,
  ref: React.createRef(),
}));

export default function HomePage() {
  const param = useLocalSearchParams();
  const selectedSection = param.section as string;

  const fetchUrlPath =
    selectedSection == "all" ? "/items/" : `/items/category/${selectedSection}`;
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = useQuery({
    queryFn: async () =>
      fetch(process.env.EXPO_PUBLIC_BACKEND_URL + fetchUrlPath).then((x) =>
        x.json()
      ) as Promise<ApiResponse<ItemWithImage[]>>,
    queryKey: ["item", selectedSection],
  });

  const [refreshing, _] = useState(false);

  return (
    <View className="bg-bgLight h-full">
      <View className="flex flex-row items-center px-2.5 pb-2.5 h-[40px]">
        <LogoWithText className="flex-grow" />
        <View className="flex justify-center bg-grayLight items-center rounded-md flex-grow ml-2.5">
          <TextInput placeholder="Search here" className="p-2 w-full" />
        </View>
      </View>

      <Tabs data={data} selectedSection={selectedSection} />

      <View className="bg-grayMedium h-full ">
        {isLoadingItems ? (
          <></>
        ) : isErrorItems ? (
          <Text className="mx-auto my-[60%] font-Poppins_600SemiBold text-lg">
            Something went wrong. Please refresh.
          </Text>
        ) : items.data.length === 0 ? (
          <Text className="mx-auto my-[60%] font-Poppins_600SemiBold text-lg">
            No item right now... List one!
          </Text>
        ) : (
          <FlatList
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
    </View>
  );
}

const Tab = React.forwardRef(
  (
    { section, selectedSection }: { section: Section; selectedSection: string },
    ref: any
  ) => {
    return (
      <Pressable
        ref={ref}
        key={section.value}
        onPress={() => {
          if (section.value === selectedSection) {
            return;
          }
          void router.replace(`/home/${section.value}`);
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
}: {
  data: SectionWithRefAndKey[];
  selectedSection: string;
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
    const idx = SECTIONS.findIndex((x) => x.value === selectedSection);
    if (measures[idx]) {
      Animated.parallel([
        Animated.timing(animatedValueX, {
          toValue: measures[idx].x,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedWidth, {
          toValue: measures[idx].width,
          duration: 110,
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
      className="border-y border-grayLight flex flex-row  min-h-[45px] max-h-[42px] "
    >
      {data.map((section) => {
        return (
          <Tab
            key={section.key}
            section={section}
            selectedSection={selectedSection}
            ref={section.ref}
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
