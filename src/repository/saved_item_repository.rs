use sqlx::{Executor, Postgres};

use crate::{error::DbError, model::item_model::Item};

pub async fn fetch_saved_items_by_user_id(
    user_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT 
            item.id, 
            item.name, 
            item.price, 
            item.user_id,
            item.description, 
            item.category::TEXT AS "category!",
            item.status::TEXT AS "status!",
            item.created_at,
            item.updated_at,
            item.images as images
        FROM saved_item 
        INNER JOIN item ON saved_item.item_id = item.id
        WHERE saved_item.user_id = $1
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn insert_saved_item(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        INSERT INTO saved_item (user_id, item_id)
        VALUES ($1, $2)
        "#,
        user_id,
        item_id
    )
    .execute(conn)
    .await?;

    Ok(())
}

pub async fn delete_saved_item(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        DELETE FROM saved_item
        WHERE user_id = $1 AND item_id = $2
        "#,
        user_id,
        item_id
    )
    .execute(conn)
    .await?;

    Ok(())
}

pub async fn get_saved_item_status_by_item_id(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<bool, DbError> {
    let saved_item = sqlx::query!(
        r#"
        SELECT item_id FROM saved_item
        WHERE user_id = $1 AND item_id = $2
        "#,
        user_id,
        item_id
    )
    .fetch_optional(conn)
    .await?;

    match saved_item {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}
