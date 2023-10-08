import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const TABS = [
  { display: "Listings", value: "0" },
  { display: "Sold", value: "1" },
];

export default function ListingPage() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;
  const selectedTabInt = parseInt(selectedTab as string);
  const tabDisplay = TABS[selectedTabInt].display;

  return (
    <View className="bg-[#F9F9F9] h-full">
      <Text className="ml-2.5 mt-6 font-Poppins_600SemiBold text-xl text-[#181818] ">
        {tabDisplay}      </Text>
      <View className="flex flex-row mt-5 w-screen justify-center items-center">
        {TABS.map((tab) => {
          return (
            <Link
              key={tab.value}
              href={`/list/${tab.value}`}
              className="mx-auto border-"
            >
              <Text
                className={`ml-2.5 mt-6 font-Poppins_600SemiBold text-base font-semibold leading-[120%]  ${
                  tab.value === selectedTab
                    ? "text-[#181818] underline underline-offset-8"
                    : "text-[#949494]"
                }`}
              >
                {tab.display}
              </Text>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
