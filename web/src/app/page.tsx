import { Item } from "~/types";
import { getItemsByCategory } from "~/api";
import ItemListingCard from "@/components/ItemListingCard";
export const IMAGES_URL = "https://images.gavinwang.dev/";
export default async function Home() {
  const data: Item[] = await getItemsByCategory("all", 0);

  return (
    <main className="m-10">
      <p className="text-4xl font">Listings</p>
      <div className="flex flex-row gap-x-2 overflow-x-scroll no-scrollbar">
        {data.map((item, index) => (
          <ItemListingCard item={item} key={index} />
        ))}
      </div>
    </main>
  );
}
