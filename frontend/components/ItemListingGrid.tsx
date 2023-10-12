import { Item } from "@prisma/client";
import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { ItemListing } from "./ItemListing";

export function ItemListingGrid(props: { items: Item[] }) {

  return (
      <FlatList data={props.items} numColumns={2} renderItem={ItemListing} />
  );
}

// const ItemView = ({ item }: { item: Item[] }) => (
//   <View key={item[0].id} className="flex flex-row justify-between mb-6 ">
//     {item.map((item) => (
//       <ItemListing key={item.id} item={item} />
//     ))}
//   </View>
// );
