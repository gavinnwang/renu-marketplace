import type { Item, User } from "@prisma/client";

export type UserWithCount = User & {
  active_listing_count: number;
  sales_done_count: number;
};
export type ItemWithImage = Item & { item_images: string[] };

export type Measure = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RefAndKey = {
  key: string;
  ref: React.RefObject<any>;
};

export type Session = {
  token: string;
  email: string;
  name: string;
};