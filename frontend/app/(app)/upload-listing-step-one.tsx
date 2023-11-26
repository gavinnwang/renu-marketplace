import { router } from "expo-router";
import { SafeAreaView, View, Text, Pressable, Dimensions } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";
import Colors from "../../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";

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

const MAX_IMAGES = 6;

export default function UploadListingStepOne() {
  const [images, setImages] = React.useState<string[]>(["picker"]);
  const [_, requestPermission] = ImagePicker.useCameraPermissions();

  const pickImage = async () => {
    if (images.length > MAX_IMAGES) {
      alert(`You can only upload ${MAX_IMAGES} images`);
      return;
    }

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0].uri;
      if (image) {
        setImages((prev) => [
          ...prev.slice(0, prev.length - 1),
          image,
          "picker",
        ]);
      }
    } else {
      console.debug("cancelled");
    }
  };

  const imageWidth = Dimensions.get("window").width / 2 - 16;
  const imageHeight = (imageWidth * 4) / 2.5;
  return (
    <>
      <SafeAreaView className="bg-bgLight">
        <View className="bg-bgLight h-full">
          <View className="flex flex-row items-center justify-between border-b border-b-stone-300">
            <Pressable onPress={router.back} className="w-10 p-3">
              <CloseIcon />
            </Pressable>
            <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary ">
              ADD PHOTOS
            </Text>
            <View className="w-10 p-3" />
          </View>
          <Text className="w-full pt-2 px-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
            Add Photos ({images.length - 1})
          </Text>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={images}
            renderItem={({ item, index }) => {
              return index === images.length - 1 ? (
                <Pressable
                  onPress={() => {
                    requestPermission().then((status) => {
                      if (status.granted) {
                        pickImage();
                      } else {
                        router.back();
                      }
                    });
                  }}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    borderRadius: 3,
                  }}
                  className="border border-dashed flex items-center justify-center"
                >
                  <Plus />
                </Pressable>
              ) : (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    borderRadius: 2,
                  }}
                />
              );
            }}
            numColumns={2}
            keyExtractor={(item) => item}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginTop: 12,
              paddingHorizontal: 10,
            }}
          />

          <View className="fixed bottom-0 h-[72px] w-full bg-bgLight border-t border-t-stone-200 py-3 px-6 flex items-center justify-center">
            <Pressable
              onPress={async () => {
                if (images.length < 2) {
                  alert("Please add at least one image");
                  return;
                }

                void router.push({
                  pathname: "/upload-listing-step-two",
                  params: {
                    images: images.slice(0, images.length - 1).join(","),
                  },
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
