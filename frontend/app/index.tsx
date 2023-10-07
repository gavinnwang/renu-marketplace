import { Text, View } from "react-native";
import { useSession } from "../providers/ctx";
import { Link } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function Index() {
  const { signOut, session, signIn } = useSession();
  const theme = useTheme();
  return (
    <View className="flex h-full w-full justify-center items-center bg-red-500 ">
      {session ? (
        <Text
        className={theme.dark ? 'text-white' : 'text-black'}
          onPress={() => {
            signOut();
          }}
        >
          Sign Out
        </Text>
      ) : (
        <View>
          <Text
            onPress={() => {
              void signIn("/");
            }}
          >
            Sign In
          </Text>
          <Link href="/one">app</Link>
        </View>
      )}
    </View>
  );
}
