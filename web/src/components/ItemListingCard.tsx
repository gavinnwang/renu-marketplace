import Link from "next/link";
import { Item } from "~/types";
import { IMAGES_URL } from "~/api";
import { CATEGORIES } from "~/constants/Category";
import Image from "next/image";

export default function ItemListingCard({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`} className="flex-shrink-0 snap-start">
      <div className="flex flex-col gap-y-2">
        <Image
          src={`${IMAGES_URL}${item.images[0]}`}
          alt={item.name}
          width={200}
          height={200}
        />
        <div>
          <p className="text-sm">{CATEGORIES[item.category]}</p>
          <p className="text-xl">{item.name}</p>
          <p className="text-base font-semibold">${item.price}</p>
        </div>
      </div>
    </Link>
  );
}
