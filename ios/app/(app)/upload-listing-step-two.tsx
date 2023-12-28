import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Circle, Path, Svg } from "react-native-svg";
import React from "react";
import { Image } from "expo-image";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import { useSession } from "../../hooks/useSession";
import { FlashList } from "@shopify/flash-list";
import LeftChevron from "../../components/LeftChevron";
import { postImages, postNewItem } from "../../api";

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

export default function UploadListingStepTwo() {
  const param = useLocalSearchParams();
  const imagesString = param.images as string;
  const images = React.useMemo(() => {
    return imagesString.split(",");
  }, [imagesString]);
  const imageWidth = Dimensions.get("window").width / 3 - 16;
  const imageHeight = (imageWidth * 4) / 2.5;

  const [category, setCategory] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");

  const { session } = useSession();

  const [uploading, setUploading] = React.useState(false);

  return (
    <>
      <SafeAreaView className="bg-bgLight">
        <View className="bg-bgLight h-full">
          <KeyboardAvoidingView
            behavior="position"
            style={{ flex: 1, zIndex: -100 }}
          >
            <View className="flex flex-row bg-bgLight items-center justify-between border-b border-b-stone-300">
              <Pressable onPress={router.back} className="w-10 p-3">
                <LeftChevron />
              </Pressable>
              <Text className="font-Poppins_600SemiBold text-lg text-blackPrimary ">
                ADD DESCRIPTIONS
              </Text>
              <View className="w-10 p-3" />
            </View>
            <ScrollView className="px-3">
              <Text className="w-full pt-3 font-Poppins_600SemiBold text-base text-blackPrimary ">
                Photos ({images.length})
              </Text>
              <View style={{ minHeight: imageHeight }}>
                <FlashList
                  className="border-b border-b-stone-200 pb-5"
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  data={images}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      style={{
                        width: imageWidth,
                        height: imageHeight,
                        borderRadius: 2,
                        marginTop: 12,
                      }}
                    />
                  )}
                  numColumns={3}
                  keyExtractor={(item) => item}
                  estimatedItemSize={80}
                />
              </View>
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
              <View className="h-10" />
            </ScrollView>
          </KeyboardAvoidingView>

          <View className="fixed bottom-0 h-[72px] w-full bg-bgLight border-t border-t-stone-200 py-3 px-6 flex items-center justify-center">
            <Pressable
              onPress={async () => {
                if (uploading) {
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
                if (Number(price) > 999) {
                  alert("Please enter a price less than $999");
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
                  router.replace(`/item/${itemId}`);
                } catch (e) {
                  console.error(e);
                }
                setUploading(false);
              }}
              className="w-full h-full bg-purplePrimary flex shadow-lg items-center justify-center"
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
