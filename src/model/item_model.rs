use serde::{Deserialize, Serialize};
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct Item {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub original_price: Option<f64>,
    pub image_url: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub user_id: i64,
}

// #[derive(Debug, Deserialize, Serialize)]
// pub struct NewItem {
//     pub name: String,
//     pub email: String,
// }
