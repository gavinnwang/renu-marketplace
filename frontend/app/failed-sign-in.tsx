import { Link } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

export default function FailedSignIn() {
    return (
        <View>
            <Text>Failed to sign in</Text>
            <Link href="/">
                Go back
            </Link>
        </View>
    )
}