import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoWithText } from "../../../components/Logo";
import { Item } from "@prisma/client";

const SECTIONS = [
  { display: "Men's", value: "mens" },
  { display: "Women's", value: "womens" },
  { display: "Life/Tools", value: "lifetools" },
  { display: "Furniture", value: "furniture" },
  { display: "Electronics", value: "electronics" },
];

export default function HomePage() {
  const param = useLocalSearchParams();

  const selectedSection = param.section;
  console.log("EEEEEEEEEE", selectedSection);

  return (
    <>
      <Stack.Screen options={{ title: "hello!" }} />
      <View className="mx-[10px]">
        <View className="flex flex-row items-center">
          <LogoWithText className="flex-grow" />
          <View className="flex justify-center items-center bg-[#F0F0F0] rounded-md flex-grow-[2]">
            <TextInput placeholder="Search here" className="p-2 w-full" />
          </View>
        </View>

        <View className="border-y border-[#EEEEEE] flex flex-row mt-3 justify-between py-1">
          {SECTIONS.map(section => {
            return (
              <Link key={section.value} href={`/home/${section.value}`}>
                <Text
                  className={`font-Poppins_400Regular text-sm  ${
                    section.value === selectedSection
                      ? "text-[#4E2A84] underline underline-offset-8"
                      : "text-[#949494]"
                  }`}>
                  {section.display}
                </Text>
              </Link>
            );
          })}
        </View>
        <Text className="font-Poppins_500Medium text-xl mt-4">Browse</Text>
        {/* <ItemListing
          item={{
            created_at: new Date(),
            id: 0,
            imageUrl: "https://picsum.photos/seed/696/3000/2000",
            name: "hello",
            price: 100,
            updated_at: new Date(),
            user_id: 0,
          }}
        /> */}
        <Thing />
      </View>
    </>
  );
}

import { Image } from "react-native";

function Thing() {
  return (
    <View>
      <Image
        source={{ uri: "https://picsum.photos/seed/696/3000/2000" }}
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
}
