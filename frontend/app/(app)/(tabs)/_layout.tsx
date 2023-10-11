import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import Colors from "../../../constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.light.background,
        },
      }}>
      <Tabs.Screen
        name="home/[section]"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: "home/mens",
        }}
      />
      <Tabs.Screen
        name="list/[tab]"
        options={{
          title: "List",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: "list/0",
        }}
      />
    </Tabs>
  );
}
