use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::item_model::{Item, ItemWithChatId, RawItem, RawItemWithChatId},
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
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.category = ? AND Item.status = 'ACTIVE'
        GROUP BY Item.id
        ORDER BY Item.created_at DESC
        "#,
        category
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn fetch_item_by_id(
    id: i32,
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
    user_id: i32,
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
        ORDER BY Item.created_at DESC
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);
    Ok(items)
}

pub async fn fetch_items_by_user_id_and_status(
    user_id: i32,
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
        ORDER BY Item.created_at DESC
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
    id: i32,
    status: String,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        UPDATE Item
        SET status = ?, updated_at = NOW()
        WHERE id = ?
        "#,
        status,
        id
    )
    .execute(conn)
    .await?;

    Ok(())
}

// fetch the item info by chat id and if there is a chat room between the user and other user regarding this item
pub async fn fetch_item_and_potential_chat_id_by_item_id(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<ItemWithChatId, DbError> {
    let raw_item = sqlx::query_as!(
        RawItemWithChatId,
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
            ItemChat.id as chat_id,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM Item
        JOIN ItemImage ON Item.id = ItemImage.item_id
        LEFT JOIN ItemChat ON ItemChat.item_id = Item.id AND (ItemChat.buyer_id = ? OR Item.user_id = ?)
        WHERE Item.id = ?
        GROUP BY Item.id, Item.name, Item.price, Item.user_id, Item.category, Item.status, Item.description, Item.created_at, Item.updated_at, ItemChat.id;
        "#,
        user_id,
        user_id,
        item_id
    ).fetch_one(conn).await?;

    Ok(ItemWithChatId {
        id: raw_item.id,
        name: raw_item.name,
        price: raw_item.price,
        item_images: match raw_item.item_images {
            Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
            None => Vec::new(),
        },
        category: raw_item.category,
        status: raw_item.status,
        user_id: raw_item.user_id,
        description: raw_item.description,
        created_at: raw_item.created_at.into(),
        updated_at: raw_item.updated_at.into(),
        chat_id: raw_item.chat_id,
    })
}
