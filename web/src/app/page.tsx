import { Item } from "~/types";
import { getGoogleUrl } from "~/util/getGoogleOauthUrl";
import { getItemsByCategory } from "~/api";
import ItemListingCard from "@/components/ItemListingCard";
import Link from "next/link";

export default async function Home() {
  const data: Item[] = await getItemsByCategory("all", 0, "no-cache");

  return (
    <main className="m-10">
      <Link
        href={getGoogleUrl({
          device_type: "web",
          callback: "http://localhost:3000",
        })}
      >
        Login
      </Link>
      <p className="text-4xl font">Listings</p>
      <div className="flex flex-row gap-x-2 overflow-x-scroll no-scrollbar">
        {data.map((item, index) => (
          <ItemListingCard item={item} key={index} />
        ))}
      </div>
    </main>
  );
}
