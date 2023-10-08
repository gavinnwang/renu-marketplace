import { Pressable, Text, View } from "react-native";
import { useSession } from "../providers/ctx";
import { Link, router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { LogoWithText } from "../components/Logo";

export default function Index() {
  const { signOut, session, signIn } = useSession();
  const theme = useTheme();
  if (session) {
    router.replace("/home/mens");
  }
  return (
    <View className="flex h-full w-full pt-4 items-center bg-[#F9F9F9]">
      {session ? (
        <View>
          <Text
            className={theme.dark ? "text-white" : "text-black"}
            onPress={() => {
              signOut();
            }}>
            Sign Out
          </Text>
          <Text>
            User name: {session.name}
            User email: {session.email}
            User token: {session.token}
          </Text>
          <Link href="/welcome">GO TO APP</Link>
          <Link href="/home/mens">Home</Link>
        </View>
      ) : (
        <View>
          <LogoWithText />
          {/* <Text className</View>="text-3xl text-center">Renu</Text> */}
          <Pressable
            className="bg-[#EEEEEE] p-3 rounded-md px-8 mt-4"
            onPress={() => signIn("/welcome")}>
            <Text className="text-xl">Sign In</Text>
          </Pressable>
          {/* <Text
            onPress={() => {
              void signIn("/");
            }}>
            Sign In
          </Text> */}
          {/* <Link href="/welcome">GO TO APP</Link> */}
        </View>
      )}
    </View>
  );
}
