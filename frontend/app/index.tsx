import { Text, View } from 'react-native';
import { useSession } from "../providers/ctx";

export default function Index() {
  const { signOut, session, signIn } = useSession();
  return (
    <View
    className='flex flex-1 justify-center items-center bg-red-500 text-blue-300i'
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     backgroundColor: "red",
    //   }}
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
          wefoiwejfoi
        </Text>
      )}
    </View>
  );
}
