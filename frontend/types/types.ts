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

export type ChatGroup = {
  chat_id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  item_name: string;
  item_price: number;
  item_category: string;
  item_description: string;
  item_status: string;
  item_image: string;
  last_message_content: string;
  last_message_sent_at: Date;
}