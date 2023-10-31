use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::user_model::PartialUser;

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
    pub user_id: i64,
}

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct ItemWithSellerInfo {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub item_images: Vec<String>,
    pub description: Option<String>,
    pub category: String,
    pub user_id: i64,
    pub seller : PartialUser
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
    pub description: Option<String>,
    pub user_id: i64,
}

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct RawItemWithSellerInfo {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub created_at: std::time::SystemTime,
    pub updated_at: std::time::SystemTime,
    pub item_images: Option<String>,
    pub category: String,
    pub description: Option<String>,
    pub user_id: i64,
    pub seller_name: String,
    pub sales_done_count: i64,
    pub active_listing_count: i64,
    pub seller_image_url: Option<String>,
}
