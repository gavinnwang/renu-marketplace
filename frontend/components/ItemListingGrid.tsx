import { Item } from "@prisma/client";
import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { ItemListing } from "./ItemListing";

export function ItemListingGrid(props: { items: Item[] }) {
  const chunkedItems = useMemo(() => {
    return props.items.reduce((results, _, idx, arr) => {
      if (idx % 2 === 0) results.push(arr.slice(idx, idx + 2));
      return results;
    }, [] as Item[][]);
  }, [props.items]);

  return (
      <FlatList data={chunkedItems} renderItem={ItemView} />
  );
}

const ItemView = ({ item }: { item: Item[] }) => (
  <View key={item[0].id} className="flex flex-row justify-between mb-6 ">
    {item.map((item) => (
      <ItemListing key={item.id} item={item} />
    ))}
  </View>
);
