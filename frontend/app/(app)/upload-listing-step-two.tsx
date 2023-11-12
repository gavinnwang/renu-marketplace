import { Slot, Stack, Tabs, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, View, Text, Pressable, Dimensions } from "react-native";
import { Circle, Path, Rect, Svg } from "react-native-svg";
import Colors from "../../constants/Colors";
import React, { useState } from "react";
import { Image } from "expo-image";

const CloseIcon = () => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke={Colors.grayPrimary}
    className="w-6 h-6"
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      d="M6 18L18 6M6 6l12 12"
    />
  </Svg>
);

export default function UploadListingStepTwo() {
  const { images } = useLocalSearchParams();
  console.log(images)
  return (
    <>
      <SafeAreaView className="bg-bgLight">
        <View className="bg-bgLight h-full">
          <View className="flex flex-row items-center justify-between border-b border-b-stone-300">
            <Pressable onPress={router.back} className="w-10 p-3">
              <CloseIcon />
            </Pressable>
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary ">
              ADD NEW LISTING
            </Text>
            <View className="w-10 p-3" />
          </View>

          <View className="fixed bottom-0 h-[72px] w-full bg-bgLight border-t border-t-stone-200 py-3 px-6 flex items-center justify-center">
            <Pressable
              onPress={() => {
                void router.push({
                  pathname: "/upload-listing-step-two",
                });
              }}
              className="w-full h-full bg-purplePrimary flex shadow-lg items-center justify-center"
            >
              <Text className="font-SecularOne_400Regular text-xl text-white">
                NEXT
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const Plus = () => (
  <Svg width="28" height="28" viewBox="-7 -7 28 28" fill="none">
    <Circle cx="7" cy="7" r="14" fill="#181818" />

    <Path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#F9F9F9" />
  </Svg>
);
