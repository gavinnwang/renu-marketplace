import { router } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Circle, Path, Svg } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image } from "expo-image";
import LeftChevron from "../../components/LeftChevron";
import {
  FlatList,
  LongPressGestureHandler,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { useSession } from "../../hooks/useSession";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import {
  IMAGES_URL,
  postAIComplete,
  postImages,
  postNewItem,
} from "../../../shared/api";
import { useQueryClient } from "@tanstack/react-query";

const MAX_IMAGES = 6;

const ItemCategory: Record<string, string> = {
  picking: "Pick a category",
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
      aspect: [1, 1],
      quality: 0.1,
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

  const imageWidth = Dimensions.get("window").width / 3 - 40;
  const imageHeight = imageWidth;

  const [category, setCategory] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");

  const { session } = useSession();

  const [uploading, setUploading] = React.useState(false);
  const iosPickerRef = React.useRef<PickerIOS>(null);
  const [completing, setCompleting] = React.useState(false);
  const queryClient = useQueryClient();

  const handleComplete = async () => {
    if (images.length === 1) {
      alert("Please add at least one image");
      return;
    }
    if (session === null) {
      alert("Please login to use this feature");
      return;
    }
    if (completing) {
      return;
    }
    setCompleting(true);
    try {
      const uploadedImage = await postImages(images.slice(0, 1));
      const imageUrl = `${IMAGES_URL}${uploadedImage[0]}`;
      console.log("imageUrl: ", imageUrl);
      const completionRes = await postAIComplete(session.token, imageUrl);
      console.log("completionRes: ", completionRes);
      setTitle(completionRes.title);
      setPrice(String(completionRes.price));
      setDescription(completionRes.description);
      if (completionRes.price === 0) {
        setCategory("free");
        iosPickerRef.current?.setState("free");
      } else if (Object.keys(ItemCategory).includes(completionRes.category)) {
        setCategory(completionRes.category);
        iosPickerRef.current?.setState(completionRes.category);
      }
    } catch (e) {
      console.error(e);
    }
    setCompleting(false);
  };
  const handleAddImage = () => {
    if (images.length > MAX_IMAGES) {
      alert(`You can only upload ${MAX_IMAGES} images`);
      return;
    }
    requestPermission().then((status) => {
      if (status.granted) {
        pickImage();
      } else {
        router.back();
      }
    });
  };
  const handleUpload = async () => {
    if (uploading) {
      return;
    }
    if (images.length === 1) {
      alert("Please add at least one image");
      return;
    }
    if (title === "") {
      alert("Please enter a title");
      return;
    }
    if (price === "") {
      alert("Please enter a price");
      return;
    }
    if (isNaN(Number(price))) {
      alert("Please enter a valid price");
      return;
    }
    if (Number(price) > 99999) {
      alert("Please enter a price less than $99999");
      return;
    }
    // if category is part of item category but not picking
    if (
      !Object.keys(ItemCategory).includes(category) ||
      category === "picking"
    ) {
      alert("Please select a valid category");
      return;
    }

    setUploading(true);
    try {
      if (images.pop() !== "picker") {
        throw new Error("Last image is not picker");
      }
      const s3UrlsResponse = await postImages(images);

      const itemId = await postNewItem(
        session?.token || "",
        title,
        Number(price),
        description,
        category,
        s3UrlsResponse
      );
      console.debug("replace to: ", `/item/${itemId}`);
      queryClient.invalidateQueries(["list"]);
      router.replace(`/item/${itemId}`);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };
  return (
    <>
      <SafeAreaView className="bg-bgLight">
        <View className="bg-bgLight h-full">
          <KeyboardAvoidingView
            behavior="position"
            style={{ flex: 1, zIndex: -100 }}
          >
            <View className="flex flex-row items-center justify-between border-b border-b-stone-300">
              <Pressable onPress={router.back} className="w-10 p-3">
                <LeftChevron />
              </Pressable>
              <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary ">
                UPLOAD LISTING
              </Text>
              <View className="w-10 p-3" />
            </View>
            <Text className="w-full pt-2 px-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
              Add Photos ({images.length - 1}){" "}
            </Text>
            <ScrollView>
              <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={images}
                scrollEnabled={true}
                style={{ marginTop: 4 }}
                horizontal
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => {
                  return index === images.length - 1 ? (
                    <TouchableOpacity
                      onPress={handleAddImage}
                      style={{
                        width: imageWidth,
                        height: imageHeight,
                        borderRadius: 3,
                      }}
                      className="border border-dashed flex items-center justify-center ml-3"
                    >
                      <Plus />
                    </TouchableOpacity>
                  ) : (
                    <LongPressGestureHandler
                      onGestureEvent={() => {
                        setImages((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: imageWidth,
                          height: imageHeight,
                          borderRadius: 3,
                          marginLeft: 12,
                        }}
                      />
                    </LongPressGestureHandler>
                  );
                }}
              />
              <View className="px-3">
                <TouchableOpacity onPress={handleComplete}>
                  <View className="px-2 py-1 mt-3 rounded-sm h-[36px] flex items-center justify-center bg-purplePrimary">
                    {completing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="font-Poppins_600SemiBold text-base text-white">
                        Auto fill with AI
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View className="pb-5 border-b border-b-stone-200">
                  <Text className="pb-2 w-full pt-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
                    Title
                  </Text>

                  <View className="bg-grayLight rounded-md">
                    <TextInput
                      onChangeText={(text) => setTitle(text)}
                      value={title}
                      placeholder="Enter a title"
                      className="p-3 h-fit"
                    />
                  </View>
                </View>
                <View className="pb-5 border-b border-b-stone-200">
                  <Text className="pb-2 w-full pt-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
                    Price
                  </Text>
                  <View className="bg-grayLight rounded-md">
                    <TextInput
                      onChangeText={(text) => setPrice(text)}
                      value={price}
                      keyboardType="numeric"
                      placeholder="Enter a price"
                      className="p-3 h-fit"
                    />
                  </View>
                </View>
                <View className=" border-b border-b-stone-200">
                  <Text className="pb-2 w-full pt-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
                    Category:{" "}
                    {ItemCategory[category] === "Pick a category"
                      ? ""
                      : ItemCategory[category]}
                  </Text>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) =>
                      setCategory(itemValue as string)
                    }
                  >
                    {Object.keys(ItemCategory).map((key) => (
                      <PickerIOS.Item
                        ref={iosPickerRef}
                        key={key}
                        label={ItemCategory[key]}
                        value={key}
                      />
                    ))}
                  </Picker>
                </View>

                <View className="pb-5">
                  <Text className="pb-2 w-full pt-3 font-Poppins_600SemiBold text-base text-blackPrimary">
                    Description
                  </Text>

                  <View className="bg-grayLight rounded-md h-[120px]">
                    <TextInput
                      collapsable
                      multiline
                      onChangeText={(text) => setDescription(text)}
                      value={description}
                      placeholder="Enter a description"
                      className="p-3 h-fit"
                    />
                  </View>
                </View>
                <View className="fixed bottom-0 h-[72px] w-full bg-bgLight border-t border-t-stone-200 py-3 px-6 flex items-center justify-center">
                  <Pressable
                    onPress={handleUpload}
                    className="w-full h-full rounded-sm bg-purplePrimary flex shadow-lg items-center justify-center"
                  >
                    {!uploading ? (
                      <Text className="font-SecularOne_400Regular text-xl text-white rounded-sm">
                        PUBLISH ITEM
                      </Text>
                    ) : (
                      <ActivityIndicator size="small" />
                    )}
                  </Pressable>
                </View>
              </View>
              <View className="h-16" />
            </ScrollView>
          </KeyboardAvoidingView>
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
