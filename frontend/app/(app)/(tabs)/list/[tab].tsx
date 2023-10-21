import { Link, useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";


const TABS = ["Listings", "Sold"];

export default function ListScreen() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;
  const selectedTabInt = parseInt(selectedTab as string);
  const tabDisplay = TABS[selectedTabInt];

  return (

    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        {tabDisplay}
      </Text>
      <View className="flex flex-row  w-screen justify-center items-center border-b border-b-grayLight">
        {TABS.map((tab, index) => {
          return (
            <Link key={tab} href={`/list/${index}`} className="mx-auto">
              <View className="">
                <Text
                  className={`ml-2.5 mt-6 font-Poppins_600SemiBold text-base font-semibold leading-7 ${
                    index === selectedTabInt
                      ? "text-blackPrimary border-b border-grayPrimary"
                      : "text-grayPrimary"
                  }`}
                >
                  {tab}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

