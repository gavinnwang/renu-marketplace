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
    pub category: String,
    pub status: String,
    pub user_id: i32,
}

#[derive(sqlx::Type)]
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

#[derive(sqlx::Type)]
#[sqlx(type_name = "category", rename_all = "snake_case")]
pub enum Category {
    Mens,
    Womens,
    Home,
    Furniture,
    Electronics,
    Bikes,
    Tickets,
    General,
    Free,
}

impl Category {
    pub fn from_str(s: &str) -> Result<Self, ()> {
        match s.to_lowercase().as_str() {
            "mens" => Ok(Category::Mens),
            "womens" => Ok(Category::Womens),
            "home" => Ok(Category::Home),
            "furniture" => Ok(Category::Furniture),
            "electronics" => Ok(Category::Electronics),
            "bikes" => Ok(Category::Bikes),
            "tickets" => Ok(Category::Tickets),
            "general" => Ok(Category::General),
            "free" => Ok(Category::Free),
            _ => Err(()),
        }
    }
}
