use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{error::DbError, model::item_model::Item};

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialItem {
    pub id: i64,
    pub name: String,
    pub price: f64,
    // pub original_price: Option<f64>,
    pub image_url: String,
    pub user_id: i64,
}

pub async fn fetch_all_items(
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<Item>, DbError> { 
    sqlx::query_as!(
        Item,
        r#"SELECT id, name, price, image_url, user_id, created_at, updated_at FROM Item"#
    )
    .fetch_all(conn)
    .await
    .map_err(Into::into)
}

pub async fn fetch_items_by_category(
    category: &str,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<Item>, DbError> {
    sqlx::query_as!(
        Item,
        r#"SELECT id, name, price, image_url, user_id, created_at, updated_at FROM Item WHERE category = ?"#,
        category
    )
    .fetch_all(conn)
    .await
    .map_err(Into::into)
}


pub async fn fetch_item_by_id(
    id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Item, DbError> {
    sqlx::query_as!(
        Item,
        r#"SELECT id, name, price, image_url, user_id, created_at, updated_at FROM Item WHERE id = ?"#,
        id
    )
    .fetch_one(conn)
    .await
    .map_err(Into::into)
}
