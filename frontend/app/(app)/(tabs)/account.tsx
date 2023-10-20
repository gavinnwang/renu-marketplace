import React from 'react';
import { Pressable, FlatList, Image } from "react-native";
import { Text, View } from "../../../components/Themed";
import { useSession } from "../../../providers/ctx";

export default function AccountScreen() {
  const { signOut } = useSession();
  
  const likedItemsData = [
    { id: '1', price: '$200', originalPrice: '$350-', image: '', title: 'Serverless Black Dress with ropes', size: 'Size XL', color: 'Color White' },
    { id: '2', price: '$200', originalPrice: '$350-', image: '', title: 'Serverless Black Dress with ropes', size: 'Size XL', color: 'Color White' },
    //  call data from db
  ];

  return (
    <View className="bg-bgLight h-full">
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <Image source={{ uri: '' }} className="w-12 h-12 rounded-full mr-4" /> {/* Profile picture placeholder */}
          <View>
            <Text className="font-family: Poppins; text-xl">Gavin MacBang</Text>
            <Text className="font-family: manrope; text-xs">420 Reviews</Text>
            <Text className="font-family: manrope; text-xs">444 Transactions</Text>
          </View>
        </View>
        <Text className="font-family: manrope; text-sm">4.3 Followers</Text>
      </View>

      <Text className="font-family: Poppins; text-xl px-4 mt-4">Liked Items</Text>
      
      <FlatList
        data={likedItemsData}
        numColumns={2}
        renderItem={({ item }) => (
          <View className="m-2 bg-white p-4">
            <Image source={{ uri: item.image }} className="w-full h-40" />
            <Text className="font-family: Poppins; text-lg mt-2">{item.price} <Text className="font-family: manrope; text-sm text-gray-500 line-through">{item.originalPrice}</Text></Text>
            <Text className="font-family: manrope; text-sm">{item.title}</Text>
            <Text className="font-family: manrope; text-xs">{item.size}</Text>
            <Text className="font-family: manrope; text-xs">{item.color}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      <Pressable onPress={signOut} className="bg-blue-500 p-4 mt-4">
        <Text className="font-family: Poppins; text-center text-white">
          Sign out 
        </Text>
      </Pressable>
    </View>
  );
}