
use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
pub struct Item {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub original_price: Option<f64>,
    pub image_url: String,
    pub created_at: std::time::SystemTime,
    pub updated_at: std::time::SystemTime,
    pub user_id: i64,
}

// #[derive(Debug, Deserialize, Serialize)]
// pub struct NewItem {
//     pub name: String,
//     pub email: String,
// }
