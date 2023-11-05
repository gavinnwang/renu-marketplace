import { Tabs } from "expo-router";
import React from "react";
import Colors from "../../../constants/Colors";

import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native";

export default function TabsLayout() {
  return (
    <>
      <SafeAreaView className="bg-bgLight"></SafeAreaView>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Colors.light.background,
          },
          tabBarActiveTintColor: Colors.blackPrimary,
        }}
      >
        <Tabs.Screen
          name="home/[section]"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
            href: "home/all",
          }}
        />
        <Tabs.Screen
          name="message/[tab]"
          options={{
            title: "Message",
            headerShown: false,
            tabBarIcon: ({ color }) => <MessageIcon color={color} />,
            href: "message/0",
          }}
        />
        <Tabs.Screen
          name="list/[tab]"
          options={{
            title: "List",
            headerShown: false,
            tabBarIcon: ({ color }) => <ListIcon color={color} />,
            href: "list/0",
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Me",
            headerShown: false,
            tabBarIcon: ({ color }) => <AccountIcon color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const HomeIcon = ({ color }: { color: string }) => (
  <Svg
    width="20"
    height="23"
    viewBox="0 0 20 23"
    fill="none"
    className="mt-1.5"
  >
    <Path
      d="M0 22.3689V7.45631L9.94175 0L19.8835 7.45631V22.3689H12.4272V13.6699H7.45631V22.3689H0Z"
      fill={color}
    />
  </Svg>
);

const MessageIcon = ({ color }: { color: string }) => (
  <Svg
    width="23"
    height="23"
    viewBox="0 0 23 23"
    fill="none"
    className="mt-1.5"
  >
    <Path
      d="M4.54453 13.3846H13.3445V11.1846H4.54453V13.3846ZM4.54453 10.0846H17.7445V7.88457H4.54453V10.0846ZM4.54453 6.78457H17.7445V4.58457H4.54453V6.78457ZM0.144531 22.1846V2.38457C0.144531 1.77957 0.360131 1.26147 0.791331 0.830272C1.22253 0.399072 1.74026 0.183839 2.34453 0.184572H19.9445C20.5495 0.184572 21.0676 0.400172 21.4988 0.831372C21.93 1.26257 22.1453 1.78031 22.1445 2.38457V15.5846C22.1445 16.1896 21.9289 16.7077 21.4977 17.1389C21.0665 17.5701 20.5488 17.7853 19.9445 17.7846H4.54453L0.144531 22.1846ZM3.60953 15.5846H19.9445V2.38457H2.34453V16.8221L3.60953 15.5846Z"
      fill={color}
    />
  </Svg>
);

const ListIcon = ({ color }: { color: string }) => (
  <Svg
    width="23"
    height="23"
    viewBox="0 0 23 23"
    fill="none"
    className="mt-1.5"
  >
    <Path
      d="M19.3314 1.40674H3.03515C2.13513 1.40674 1.40552 2.13635 1.40552 3.03637V19.3327C1.40552 20.2327 2.13513 20.9623 3.03515 20.9623H19.3314C20.2315 20.9623 20.9611 20.2327 20.9611 19.3327V3.03637C20.9611 2.13635 20.2315 1.40674 19.3314 1.40674Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <Path
      d="M11.1833 6.83887V15.5302M6.83765 11.1845H15.529"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AccountIcon = ({ color }: { color: string }) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="mt-1.5"
  >
    <Path
      d="M1.22217 19.9762C1.22217 18.5985 1.76944 17.2773 2.74359 16.3032C3.71773 15.329 5.03896 14.7817 6.41661 14.7817H16.8055C18.1832 14.7817 19.5044 15.329 20.4785 16.3032C21.4527 17.2773 21.9999 18.5985 21.9999 19.9762C21.9999 20.665 21.7263 21.3256 21.2392 21.8127C20.7522 22.2998 20.0916 22.5734 19.4027 22.5734H3.81939C3.13056 22.5734 2.46995 22.2998 1.98288 21.8127C1.4958 21.3256 1.22217 20.665 1.22217 19.9762Z"
      stroke={color}
      strokeWidth="2.3"
      strokeLinejoin="round"
    />
    <Path
      d="M11.6112 9.58732C13.7628 9.58732 15.507 7.8431 15.507 5.69149C15.507 3.53988 13.7628 1.79565 11.6112 1.79565C9.45956 1.79565 7.71533 3.53988 7.71533 5.69149C7.71533 7.8431 9.45956 9.58732 11.6112 9.58732Z"
      stroke={color}
      strokeWidth="2.3"
    />
  </Svg>
);
