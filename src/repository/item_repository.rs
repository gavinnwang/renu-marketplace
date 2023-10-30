use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::{item_model::{Item, ItemWithSellerInfo, RawItem, RawItemWithSellerInfo}, user_model::PartialUser},
};

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialItem {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub image_url: String,
    pub user_id: i64,
}
pub fn convert_raw_into_items(raw_items: Vec<RawItem>) -> Vec<Item> {
    raw_items
        .into_iter()
        .map(|raw_item| convert_raw_into_item(raw_item))
        .collect()
}

pub fn convert_raw_into_item(raw_item: RawItem) -> Item {
    Item {
        id: raw_item.id,
        name: raw_item.name,
        price: raw_item.price,
        item_images: match raw_item.item_images {
            Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
            None => Vec::new(),
        },
        category: raw_item.category,
        user_id: raw_item.user_id,
        created_at: raw_item.created_at.into(),
        updated_at: raw_item.updated_at.into(),
    }
}
pub fn convert_raw_with_seller_info_into_item(
    raw_item: RawItemWithSellerInfo,
) -> ItemWithSellerInfo {
    ItemWithSellerInfo {
        id: raw_item.id,
        name: raw_item.name,
        price: raw_item.price,
        item_images: match raw_item.item_images {
            Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
            None => Vec::new(),
        },
        category: raw_item.category,
        user_id: raw_item.user_id,
        created_at: raw_item.created_at.into(),
        updated_at: raw_item.updated_at.into(),
        seller: PartialUser {
            id: raw_item.user_id,
            name: raw_item.seller_name,
            email: "".to_string(),
            profile_image: raw_item.seller_image_url,
            active_listing_count: raw_item.active_listing_count,
            sales_done_count: raw_item.sales_done_count,
        },
    }
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
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.category = ?
        GROUP BY Item.id
        "#,
        category
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn fetch_item_by_id(
    id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Item, DbError> {
    let raw_item = sqlx::query_as!(
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
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.id = ?
        GROUP BY Item.id
        "#,
        id
    )
    .fetch_one(conn)
    .await?;

    let item = convert_raw_into_item(raw_item);
    Ok(item)
}

pub async fn fetch_item_with_seller_info_by_id(
    id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<ItemWithSellerInfo, DbError> {
    let raw_item = sqlx::query_as!(
        RawItemWithSellerInfo,
        r#"
        SELECT
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category,
            Item.created_at, 
            Item.updated_at,
            User.name AS seller_name,
            User.profile_image as seller_image_url,
            User.sales_done_count,
            User.active_listing_count,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.id = ?
        INNER JOIN User ON Item.user_id = User.id
        GROUP BY Item.id,
        User.id
        "#,
        id
    )
    .fetch_one(conn)
    .await?;

    let item = convert_raw_with_seller_info_into_item(raw_item);
    Ok(item)
}
