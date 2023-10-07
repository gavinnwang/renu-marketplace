import EditScreenInfo from "../../../components/EditScreenInfo";
import { Text, View } from "../../../components/Themed";

export default function TabTwoScreen() {
  return (
    <View >
      <Text className="text-amber-600">Tab three</Text>
      <View
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}
