import { Link } from "expo-router";
import React from "react";

import { Text, View } from "react-native";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <Text className="bg-blue-600 p-2 rounded-md text-white">{path}</Text>
      <Link href="/">
        <Text className="text-red-600">go to sign in page</Text>
      </Link>
    </View>
  );
}
