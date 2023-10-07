import { Text, View } from "react-native";
import { useSession } from "../../providers/ctx";
import { Link } from "expo-router";

export default function Index() {
  const { session } = useSession();
  return (
    <View className="flex flex-1 justify-center items-center bg-gray-50">
      <Text>hello you signed in. your name is {session!.name} </Text>
      <Link href="/one">go to app now</Link>
    </View>
  );
}
