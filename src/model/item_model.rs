use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct Item {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub item_images: Vec<String>,
    pub description: Option<String>,
    pub category: String,
    pub status: String,
    pub user_id: i64,
}



#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct RawItem {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub created_at: std::time::SystemTime,
    pub updated_at: std::time::SystemTime,
    pub item_images: Option<String>,
    pub category: String,
    pub status: String,
    pub description: Option<String>,
    pub user_id: i64,
}

