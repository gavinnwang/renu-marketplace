import {
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Measure, RefAndKey } from "../../../../types/types";
import Colors from "../../../../constants/Colors";
import React from "react";

const TABS = ["Buy", "Sell"];
const data = TABS.map((i) => ({
  key: i,
  ref: React.createRef(),
}));

export default function MessageScreen() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;
  const selectedTabInt = parseInt(selectedTab as string);

  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Messages
      </Text>
      <Tabs data={data} selectedTabInt={selectedTabInt} />
    </View>
  );
}

const ChatRow = () => {
  const width = (Dimensions.get("window").width - 130) / 2;
  return (
    <View className="flex flex-row items-start justify-between mt-2 pl-4 pr-6 pb-2.5 min-h-[43px]">
      <Image
        source={{ uri: "https://i.imgur.com/w9F0IAR.jpeg" }}
        className="object-cover rounded-sm"
        style={{
          width: width,
          maxWidth: width - 20,
          height: (width * 4) / 3,
        }}
      />
      <View className=" flex-row">
        <View className="flex-col justify-start">
          <Text className=" font-Poppins_500Medium text-sm">
            Seller Name Example
          </Text>
          <Text> Product Name Example</Text>
          <Text>Product category example</Text>
        </View>
        <View className="flex-col justify-start">
          <Text>3 Days Ago</Text>
          <View className=" bg-purplePrimary rounded-full">
            <Text className=" text-white">99</Text>
          </View>
        </View>
      </View>
    </View>
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
                ? "text-blackPrimary border-b border-grayPrimary"
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
    ></Animated.View>
  );
};
