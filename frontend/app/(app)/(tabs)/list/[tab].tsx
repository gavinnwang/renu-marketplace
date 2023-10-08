import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const TABS = [
  { display: "Listings", value: "listings" },
  { display: "Sold", value: "sold" },
];

export default function ListingPage() {
  const param = useLocalSearchParams();
  const selectedTab = param.tab;

  return (
    <View className="bg-[#F9F9F9] h-full">
      <Text className="ml-2.5 mt-6 font-Poppins_600SemiBold text-xl text-[#181818] ">
        {selectedTab}
      </Text>
      <View className="border-b flex flex-row mt-6 ">
        {TABS.map((tab) => {
          return (
            <Link key={tab.value} href={`/list/${tab.value}`}>
              <Text
                className={`font-Poppins_400Regular text-sm  ${
                  tab.value === selectedTab
                    ? "text-[#4E2A84] underline underline-offset-8"
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
