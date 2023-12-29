import { Item } from "~/types";
import { getGoogleUrl } from "~/util/getGoogleOauthUrl";
import { API_URL, getItemsByCategory, getUserMeInfo } from "~/api";
import ItemListingCard from "@/components/ItemListingCard";
import Link from "next/link";
import Header from "@/components/Header";
import { cookies } from "next/headers";

function getToken() {
  const cookieStore = cookies();
  const jwtToken = cookieStore.get("token");
  return jwtToken?.value;
}

export default async function Home() {
  const data: Item[] = (await getItemsByCategory("all", 0, "no-cache")).slice(
    0,
    7
  );
  const token = getToken();

  const user = await getUserMeInfo(token ?? "");

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
      {user?.name}
      <p className="text-4xl font">Listings</p>
      <div className="flex flex-row gap-x-2">
        {data.map((item, index) => (
          <ItemListingCard item={item} key={index} />
        ))}
      </div>
    </main>
  );
}
