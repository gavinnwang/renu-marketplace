use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::item_model::{Item, RawItem},
};

use super::item_processing::convert_raw_into_items;

pub async fn fetch_saved_items_by_user_id(
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
            Item.description, 
            Item.category,
            Item.status,
            Item.created_at,
            Item.updated_at,
            Item.images as images
        FROM SavedItem
        INNER JOIN Item ON SavedItem.item_id = Item.id
        WHERE SavedItem.user_id = ?
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);

    Ok(items)
}

pub async fn insert_saved_item(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        INSERT INTO SavedItem (user_id, item_id)
        VALUES (?, ?)
        "#,
        user_id,
        item_id
    )
    .execute(conn)
    .await?;

    Ok(())
}