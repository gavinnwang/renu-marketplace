
use chrono::prelude::*;
use serde::{Deserialize, Serialize};


#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub id: Option<String>,
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: String,
    pub photo: String,
    pub verified: bool,
    pub provider: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}