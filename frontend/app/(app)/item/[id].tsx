import { router, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

const LeftIcon = () => (
  <Svg
    width="25"
    height="33"
    viewBox="0 0 25 33"
    fill="none"
    onPress={router.back}>
    <Path
      d="M14.5833 9.625L9.375 16.5L14.5833 23.375"
      stroke="#958F91"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default function ItemPage() {
  const param = useLocalSearchParams();
  const itemId = param.id;

  return (
    <View>
      <View className="flex flex-row">
        <LeftIcon />
      </View>
      <Text>Hi</Text>
      <Text>Id: {itemId}</Text>
    </View>
  );
}
