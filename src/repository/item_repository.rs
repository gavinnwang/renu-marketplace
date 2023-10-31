use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::item_model::{Item, RawItem},
};

use super::item_processing::{convert_raw_into_item, convert_raw_into_items};

pub async fn fetch_items_by_status(
    status: String,
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
            Item.status,
            Item.created_at, 
            Item.description,
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.status = ?
        GROUP BY Item.id
        ORDER BY Item.created_at DESC
        "#,
        status
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
            Item.status,
            Item.description,
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
            Item.status,
            Item.description,
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

pub async fn fetch_items_by_user_id(
    user_id: i64,
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
            Item.status,
            Item.description,
            Item.created_at, 
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.user_id = ? 
        GROUP BY Item.id
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn fetch_items_by_user_id_and_status(
    user_id: i64,
    status: String,
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
            Item.status,
            Item.description,
            Item.created_at, 
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.user_id = ? AND Item.status = ?
        GROUP BY Item.id
        "#,
        user_id,
        status
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn update_item_status(
    id: i64,
    status: String,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        UPDATE Item
        SET status = ?
        WHERE id = ?
        "#,
        status,
        id
    )
    .execute(conn)
    .await?;

    Ok(())
}