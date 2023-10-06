
use chrono::prelude::*;
use serde::{Deserialize, Serialize};


#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub role: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct NewUser {
    pub name: String,
    pub email: String,
}
