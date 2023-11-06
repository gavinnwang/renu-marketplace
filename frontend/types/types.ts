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
// #[derive(Debug, Deserialize, Serialize)]
// pub struct ChatGroup {
//     pub chat_id: i64,
//     pub item_id: i64,
//     pub buyer_id: i64,
//     pub seller_id: i64,
//     pub item_name: String,
//     pub price: f64,
//     pub category: String,
//     pub description: Option<String>,
//     pub status: String,
//     pub created_at: DateTime<Utc>,
//     pub updated_at: DateTime<Utc>,
// }

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
  created_at: string;
  updated_at: string;
  item_image: string;
}