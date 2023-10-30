
use chrono::prelude::*;
use serde::{Deserialize, Serialize};


#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub role: String,
    pub profile_image: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct NewUser {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialUser {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub profile_image: Option<String>,
    pub active_listing_count: i64,
    pub sales_done_count: i64,
}

