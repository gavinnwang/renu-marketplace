use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub images: serde_json::Value,
    pub description: Option<String>,
    pub location: Option<String>,
    pub category: String,
    pub status: String,
    pub user_id: i32,
}

#[derive(sqlx::Type, Debug, Deserialize, Serialize)]
#[sqlx(type_name = "item_status", rename_all = "snake_case")]
pub enum ItemStatus {
    Active,
    Inactive,
}

impl ItemStatus {
    pub fn from_str(s: &str) -> Result<Self, ()> {
        match s.to_lowercase().as_str() {
            "active" => Ok(ItemStatus::Active),
            "inactive" => Ok(ItemStatus::Inactive),
            _ => Err(()),
        }
    }
}

#[derive(sqlx::Type, Debug, Deserialize, Serialize)]
#[sqlx(type_name = "category", rename_all = "snake_case")]
pub enum Category {
    Apparel,
    Furniture,
    Vehicles,
    Electronics,
    Home,
    Other,
    Free,
}

impl Category {
    pub fn from_str(s: &str) -> Result<Self, ()> {
        match s.to_lowercase().as_str() {
            "apparel" => Ok(Category::Apparel),
            "home" => Ok(Category::Home),
            "furniture" => Ok(Category::Furniture),
            "electronics" => Ok(Category::Electronics),
            "vehicles" => Ok(Category::Vehicles),
            "other" => Ok(Category::Other),
            "free" => Ok(Category::Free),
            _ => Err(()),
        }
    }
}
