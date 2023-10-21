import type { Item } from "@prisma/client";

export type ItemWithImage = Item & { item_images: string[] };
