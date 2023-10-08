use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{error::DbError, model::item_model::Item};

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialItem {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub original_price: Option<f64>,
    pub image_url: String,
    pub user_id: i64,
}

pub async fn fetch_all_items(
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<PartialItem>, DbError> {
    sqlx::query_as!(
        PartialItem,
        r#"SELECT id, name, price, original_price, image_url, user_id FROM Item"#
    )
    .fetch_all(conn)
    .await
    .map_err(Into::into)
}

pub async fn fetch_item_by_id(
    id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<PartialItem, DbError> {
    sqlx::query_as!(
        PartialItem,
        r#"SELECT id, name, price, original_price, image_url, user_id FROM Item WHERE id = ?"#,
        id
    )
    .fetch_one(conn)
    .await
    .map_err(Into::into)
}
