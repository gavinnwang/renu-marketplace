import Image from "next/image";
import { Item } from "../../../shared/types";
import { getItemsByCategory } from "../../../shared/api";
import ItemListingCard from "@/components/ItemListingCard";
export const IMAGES_URL = "https://images.gavinwang.dev/";
export default async function Home() {
  const data: Item[] = await getItemsByCategory("all", 0);

  return (
    <main className="">
      {data.map((item, index) => (
        <ItemListingCard item={item} key={index} />
      ))}
    </main>
  );
}
