import React from "react";
import { Text, View, ScrollView, RefreshControl } from "react-native";
import Colors from "../../../../shared/constants/Colors";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ItemListing } from "../../../components/ItemListing";
import Svg, { Path } from "react-native-svg";
import { useSession } from "../../../hooks/useSession";
import { getSavedItems, getUserMeInfo } from "../../../../shared/api";
import { TouchableOpacity } from "react-native-gesture-handler";
import RefreshScreen from "../../../components/RefreshScreen";
import { FlashList } from "@shopify/flash-list";
import * as Linking from "expo-linking";
import { router } from "expo-router";

export default function AccountScreen() {
  const { signOut, session } = useSession();
  // console.debug(session);

  const {
    data: user,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => getUserMeInfo(session!.token),
    enabled: !!session && !!session.token,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const handleEmailLink = () => {
    const email = "gavinwang313@gmail.com";
    const subject = encodeURIComponent("[Renu Feedback]");
    const url = `mailto:${email}?subject=${subject}`;
    Linking.openURL(url).catch((err) => console.error(err));
  };

  return (
    <View className="bg-bgLight h-full">
      <View className="flex-row items-center  ">
        <Text className="m-2.5 mt-2 font-Poppins_600SemiBold text-xl ">
          My Profile
        </Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
          />
        }
        className="bg-bgLight h-full"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View className="flex flex-row items-start">
          <Image
            source={{
              uri: user?.profile_image ?? "",
            }}
            style={{
              borderColor: Colors.whitePrimary,
            }}
            className="w-16 h-16 rounded-full border border-white ml-2.5 bg-blackPrimary"
          />

          <View className="flex-row mt-2 items-end justify-bottom justify-between px-2.5 pb-2">
            <View className="flex-col w-[200px]">
              <Text className="text-xl mb-1 font-Poppins_500Medium text-left max-w-[160px] h-[30px]">
                {user?.name ?? session?.name}
              </Text>

              <View className="flex-row">
                <Text className="font-Manrope_400Regular text-sm mr-3">
                  <Text className="font-Manrope_600SemiBold">
                    {user?.active_listing_count ?? 0}
                  </Text>{" "}
                  Active Listings
                </Text>
                <Text className="font-Manrope_400Regular text-sm">
                  <Text className="font-Manrope_600SemiBold">
                    {user?.sales_done_count ?? 0}
                  </Text>{" "}
                  Sales Done
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="w-full h-2 bg-grayLight mt-2" />

        <TouchableOpacity
          className="ml-2.5 mt-2 mb-1"
          onPress={() => {
            router.push("/saved");
          }}
        >
          <Text className="font-Manrope_500Medium text-base">Saved items</Text>
        </TouchableOpacity>
        <View className="w-full h-2 bg-grayLight mt-2" />

        <TouchableOpacity
          className="ml-2.5 mt-2 mb-1"
          onPress={handleEmailLink}
        >
          <Text className="font-Manrope_500Medium text-base">
            Give us feedbacks
          </Text>
        </TouchableOpacity>

        <View className="w-full h-2 bg-grayLight mt-2" />

        <TouchableOpacity className="ml-2.5 mt-2 mb-1" onPress={signOut}>
          <Text className="font-Manrope_500Medium text-base">Sign out</Text>
        </TouchableOpacity>

        {/* <View className="w-full h-full bg-grayLight mt-2" /> */}

        {/* <Text className="ml-2.5 mt-4 mb-3 font-Poppins_600SemiBold text-xl">
          Saved Items
          <Text className="font-Poppins_500Medium text-sm">
            {" "}
            ({savedItemData?.length ?? 0})
          </Text>
        </Text>

        <View className="bg-greyLight h-full">
          {isLoadingSavedItem ? (
            <></>
          ) : isErrorSavedItem ? (
            <RefreshScreen
              displayText="Something went wrong."
              refetch={refetch}
              marginTop="30%"
            />
          ) : savedItemData.length === 0 ? (
            <RefreshScreen
              displayText="You have no saved items."
              refetch={refetch}
              marginTop="30%"
            />
          ) : (
            <FlashList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={savedItemData}
              numColumns={2}
              contentContainerStyle={{
                paddingTop: 10,
                paddingLeft: 10,
              }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={ItemListing}
              estimatedItemSize={320}
              removeClippedSubviews={true}
            />
          )}
        </View> */}
      </ScrollView>
    </View>
  );
}

const DownArrowIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path
      d="M4.12774 7.32321L11 14.0222L17.8722 7.32321C17.995 7.20328 18.1598 7.13614 18.3315 7.13614C18.5031 7.13614 18.668 7.20328 18.7907 7.32321C18.8502 7.38146 18.8974 7.45099 18.9297 7.52773C18.9619 7.60446 18.9785 7.68686 18.9785 7.77009C18.9785 7.85332 18.9619 7.93572 18.9297 8.01245C18.8974 8.08918 18.8502 8.15871 18.7907 8.21696L11.4799 15.345C11.3515 15.4701 11.1793 15.5401 11 15.5401C10.8207 15.5401 10.6485 15.4701 10.5201 15.345L3.20924 8.21834C3.14936 8.16004 3.10178 8.09035 3.06928 8.01336C3.03679 7.93637 3.02005 7.85365 3.02005 7.77009C3.02005 7.68652 3.03679 7.60381 3.06928 7.52682C3.10178 7.44983 3.14936 7.38013 3.20924 7.32184C3.33202 7.20191 3.49685 7.13477 3.66849 7.13477C3.84012 7.13477 4.00495 7.20191 4.12774 7.32184V7.32321Z"
      fill="black"
    />
  </Svg>
);
