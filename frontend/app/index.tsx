import { Text, View } from "react-native";
import { useSession } from "../providers/ctx";
import { Link } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function Index() {
  const { signOut, session, signIn } = useSession();
  const theme = useTheme();
  return (
    <View className="flex h-full w-full justify-center items-center">
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
          <Link href="/home">Home</Link>
        </View>
      ) : (
        <View>
          <Text
            onPress={() => {
              void signIn("/");
            }}>
            Sign In
          </Text>
          <Link href="/welcome">GO TO APP</Link>
        </View>
      )}
    </View>
  );
}
