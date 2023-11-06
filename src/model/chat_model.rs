use chrono::{Utc, DateTime};
use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct RawChatGroup {
    pub chat_id: i64,
    pub item_id: i64,
    pub other_user_id: i64,
    pub other_user_name: String,
    pub item_name: String,
    pub item_price: f64,
    pub item_category: String,
    pub item_description: Option<String>,
    pub item_status: String,
    pub item_image: Option<String>,
    pub created_at: std::time::SystemTime,
    pub updated_at: std::time::SystemTime,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ChatGroup {
    pub chat_id: i64,
    pub item_id: i64,
    pub other_user_id: i64,
    pub other_user_name: String,
    pub item_name: String,
    pub item_price: f64,
    pub item_category: String,
    pub item_description: Option<String>,
    pub item_status: String,
    pub item_image: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}