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
