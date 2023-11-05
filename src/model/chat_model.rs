use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct ChatGroup {
    pub chat_id: i64,
    pub item_id: i64,
    pub buyer_id: i64,
    pub item_name: String,
    pub price: f64,
    pub category: String,
    pub description: Option<String>,
    pub status: String,
    pub created_at: std::time::SystemTime,
    pub updated_at: std::time::SystemTime,
}