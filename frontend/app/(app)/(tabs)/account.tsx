import { Pressable } from "react-native";
import { Text, View } from "../../../components/Themed";
import { useSession } from "../../../providers/ctx";

export default function AccountScreen() {
  const {signOut} = useSession();
  return (
    <View className="bg-bgLight h-full">
      <Text>Account Page</Text>
      <Pressable onPress={signOut}>
        <Text>
          Sign out 
        </Text>
      </Pressable>
    </View>
  );
}
