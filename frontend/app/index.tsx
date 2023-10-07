import { Text, View } from "react-native";
import { useSession } from "../providers/ctx";

export default function Index() {
  const { signOut, session, signIn } = useSession();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
      }}
    >
      {session ? (
        <Text
          onPress={() => {
            signOut();
          }}
        >
          Sign Out
        </Text>
      ) : (
        <Text
          onPress={() => {
            signIn();
          }}
        >
          Sign In
        </Text>
      )}
    </View>
  );
}
