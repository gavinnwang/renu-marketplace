import { Text, View, Image, Dimensions } from "react-native";
import { Link, Tabs, router, useLocalSearchParams } from "expo-router";

const param = useLocalSearchParams();
const selectedTab = param.tab;
const TABS = ["Buy", "Sold"];
const selectedTabInt = parseInt(selectedTab as string);

const tabDisplay = TABS[selectedTabInt];


export default function MessageScreen() {
  return (
    <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        Messages
      </Text>
      <View className="bg-bgLight h-full">
      <Text className="ml-2.5 mt-4 font-Poppins_600SemiBold text-xl text-blackPrimary ">
        {tabDisplay}
      </Text>
      <Tabs/>
      {false ? (
        <Text className="mx-auto my-[50%] font-Poppins_600SemiBold text-lg">
          Something wrong happened...
        </Text>
      ) : false ? (
        <></>
      ) : 0 === 0 ? (
        <Text className="mx-auto my-[50%] font-Poppins_600SemiBold text-lg">
          No item found.
        </Text>
      ) : (
        <ChatRow/>
      )}
    </View>
  );
      
    </View>
  );
}

const ChatRow = (
  
) => {
  const width = (Dimensions.get("window").width - 130) / 2;
  return (
    <View className="flex flex-row items-start justify-between mt-2 pl-4 pr-6 pb-2.5 min-h-[43px]">
      <Image
        source={{ uri: "https://i.imgur.com/w9F0IAR.jpeg"}}
        className="object-cover rounded-sm"
        style={{
          width: width,
          maxWidth: width - 20,
          height: (width * 4) / 3,
        }}

      />
      <View className=" flex-row">
        <View className="flex-col justify-start">
          <Text className=" font-Poppins_500Medium text-sm">Seller Name Example</Text>
          <Text> Product Name Example</Text>
          <Text>Product category example</Text>
        </View>
        <View className="flex-col justify-start">
          <Text>3 Days Ago</Text>
          <View className=" bg-purplePrimary rounded-full">
            <Text className=" text-white">
              99
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
