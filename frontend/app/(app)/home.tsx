import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoWithText } from "../../components/Logo";

export default function HomePage() {
  return (
    <>
      <Stack.Screen options={{ title: "hello!" }} />
      <SafeAreaView>
        <LogoWithText />
        <Text className="font-Poppins_300Light">
          This screen doesn't exist.
        </Text>

        <Link href="/">
          <Text>Go to home screen!</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}
