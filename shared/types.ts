export type Item = {
  id: number;
  name: string;
  price: number;
  category:
    | "apparel"
    | "home"
    | "furniture"
    | "electronics"
    | "vehicles"
    | "other"
    | "free";
  description?: string;
  location?: string;
  status: "active" | "inactive";
  user_id: number;
  created_at: Date;
  images: string[];
  updated_at: Date;
};

export const ItemCategory: Record<string, string> = {
  picking: "Pick a category",
  apparel: "Apparel",
  home: "Home & Tools",
  furniture: "Furniture",
  electronics: "Electronics",
  vehicles: "Vehicles",
  other: "Other",
  free: "Free",
};

export type User = {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  created_at: Date;
  updated_at: Date;
  active_listing_count: number;
  sales_done_count: number;
  verified: boolean;
};

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
  user_id: number;
};

export type AppleAuthResponse = {
  token: string;
  email: string;
  user_id: number;
};

export type ChatGroup = {
  chat_id: number;
  item_id: number;
  other_user_id: number;
  other_user_name: string;
  item_name: string;
  item_price: number;
  item_category: string;
  item_description: string;
  item_status: string;
  item_images: string[];
  last_message_content: string | null;
  last_message_sent_at: Date | null;
  unread_count: number;
};

export type ChatMessage = {
  id: number;
  content: string;
  sent_at: string | null;
  from_me: number;
};

export type AICompleteResponse = {
  price: number;
  title: string;
  description: string;
  category: string;
};

export type SearchHistory = {
  created_at: Date;
  query: string;
}[];
