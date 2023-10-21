use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{error::DbError, model::item_model::Item};

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialItem {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub image_url: String,
    pub user_id: i64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ItemWithSeller {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub image_url: String,
    pub user_id: i64,
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
    pub user_id: i64,
}

pub fn convert_raw_into_items(raw_items: Vec<RawItem>) -> Vec<Item> {
    raw_items
        .into_iter()
        .map(|raw_item| {
            let item_images: Vec<String> = match raw_item.item_images {
                Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
                None => Vec::new(),
            };

            Item {
                id: raw_item.id,
                name: raw_item.name,
                price: raw_item.price,
                item_images,
                category: raw_item.category,
                user_id: raw_item.user_id,
                created_at: raw_item.created_at.into(),
                updated_at: raw_item.updated_at.into(),
            }
        })
        .collect()
}

pub async fn fetch_all_items(
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<Item>, DbError> {
    let raw_items = sqlx::query_as!(
        RawItem,
        r#"
        SELECT
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category,
            Item.created_at, 
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id
        GROUP BY Item.id
        "#
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn fetch_items_by_category(
    category: &str,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<Item>, DbError> {
    let raw_items = sqlx::query_as!(
        RawItem,
        r#"
        SELECT
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category,
            Item.created_at, 
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item  
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id && Item.category = ?
        GROUP BY Item.id
        "#,
        category
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

// pub async fn fetch_item_by_id(
//     id: i64,
//     conn: impl Executor<'_, Database = MySql>,
// ) -> Result<Item, DbError> {
//     let item = sqlx::query_as!(
//         Item,
//         r#"SELECT id, name, price, image_url, user_id, created_at, updated_at FROM Item WHERE id = ?"#,
//         id
//     )
//     .fetch_one(conn)
//     .await?;

//     Ok(item)
// }

// pub async fn fetch_item_with_seller_by_id(
//     id: i64,
//     conn: impl Executor<'_, Database = MySql>,
// ) -> Result<Item, DbError> {
//     let item = sqlx::query_as!(
//         ItemWithSeller,
//         r#"SELECT
//         i.id, i.name, i.price, i.image_url, i.user_id,
//         u.id, u.username, u.created_at, u.updated_at
//         FROM Item i INNER JOIN User u ON i.user_id = u.id WHERE i.id = ?"#,
//         id
//     )
//     .fetch_one(conn)
//     .await?;

//     Ok(item)
// }

// pub async fn fetch_items_by_user_id(
//     user_id: i64,
//     conn: impl Executor<'_, Database = MySql>,
// ) -> Result<Vec<Item>, DbError> {
//     let items = sqlx::query_as!(
//         Item,
//         r#"SELECT id, name, price, image_url, user_id, created_at, updated_at FROM Item WHERE user_id = ?"#,
//         user_id
//     )
//     .fetch_all(conn)
//     .await?;

//     Ok(items)
// }
