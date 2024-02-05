use serde_json::Value;
use sqlx::{Executor, Postgres};

use crate::{
    error::DbError,
    model::item_model::{Category, Item, ItemStatus},
};

pub async fn fetch_items_by_status(
    status: ItemStatus,
    limit: i32,
    offset: i32,
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
            item.category::TEXT AS "category!",
            item.status::TEXT AS "status!",
            item.created_at, 
            item.description,
            item.location,
            item.updated_at,
            item.images as images
        FROM item
        WHERE item.status = $1
        ORDER BY item.created_at DESC
        LIMIT $2
        OFFSET $3;
        "#,
        status as ItemStatus,
        limit as i64,
        offset as i64
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_not_blocked_items_by_status(
    user_id: i32,
    status: ItemStatus,
    limit: i32,
    offset: i32,
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
            item.category::TEXT AS "category!",
            item.status::TEXT AS "status!",
            item.created_at, 
            item.description,
            item.location,
            item.updated_at,
            item.images as images
        FROM item
        LEFT JOIN blocked_user ON item.user_id = blocked_user.blocked_user_id AND blocked_user.blocker_user_id = $1
        WHERE item.status = $2 AND blocked_user.blocker_user_id IS NULL
        ORDER BY item.created_at DESC
        LIMIT $3
        OFFSET $4;
        "#,
        user_id,
        status as ItemStatus,
        limit as i64,
        offset as i64,
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_active_items_by_category(
    category: Category,
    limit: i32,
    offset: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT
            Item.id,
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category::TEXT AS "category!",
            Item.status::TEXT AS "status!",
            Item.description,
            Item.location,
            Item.created_at, 
            Item.updated_at,
            Item.images as images
        FROM Item 
        WHERE Item.category = $1 AND Item.status = 'active'
        ORDER BY Item.created_at DESC
        LIMIT $2
        OFFSET $3;
        "#,
        category as Category,
        limit as i64,
        offset as i64
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_not_blocked_active_items_by_category(
    user_id: i32,
    category: Category,
    limit: i32,
    offset: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT
            Item.id,
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category::TEXT AS "category!",
            Item.status::TEXT AS "status!",
            Item.description,
            Item.location,
            Item.created_at, 
            Item.updated_at,
            Item.images as images
        FROM Item 
        LEFT JOIN blocked_user ON Item.user_id = blocked_user.blocked_user_id AND blocked_user.blocker_user_id = $1
        WHERE Item.category = $2 AND Item.status = 'active' AND blocked_user.blocker_user_id IS NULL
        ORDER BY Item.created_at DESC
        LIMIT $3
        OFFSET $4;
        "#,
        user_id,
        category as Category,
        limit as i64,
        offset as i64
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_item_by_id(
    id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Item, DbError> {
    let item = sqlx::query_as!(
        Item,
        r#"
            SELECT
                Item.id, 
                Item.name, 
                Item.price, 
                Item.user_id, 
                Item.category::TEXT as "category!",
                Item.status::TEXT as "status!",
                Item.description,
                Item.location,
                Item.created_at, 
                Item.updated_at,
                Item.images as images
            FROM Item
            WHERE Item.id = $1
        "#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(item)
}

pub async fn fetch_items_by_user_id(
    user_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category::TEXT AS "category!",
            Item.status::TEXT AS "status!",
            Item.description,
            Item.location,
            Item.created_at, 
            Item.updated_at,
            Item.images as images
        FROM Item
        WHERE Item.user_id = $1
        ORDER BY Item.created_at DESC
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_items_by_user_id_and_status(
    user_id: i32,
    status: ItemStatus,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id, 
            Item.category::TEXT AS "category!",
            Item.status::TEXT AS "status!",
            Item.description,
            Item.location,
            Item.created_at, 
            Item.updated_at,
            Item.images as images
        FROM Item
        WHERE Item.user_id = $1 AND Item.status = $2
        ORDER BY Item.created_at DESC
        "#,
        user_id,
        status as ItemStatus
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn update_item_status(
    id: i32,
    status: ItemStatus,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        UPDATE Item
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        "#,
        status as ItemStatus,
        id
    )
    .execute(conn)
    .await?;

    Ok(())
}

pub async fn insert_item(
    user_id: i32,
    name: String,
    price: f64,
    category: Category,
    description: Option<String>,
    images: Vec<String>,
    location: Option<String>,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<i32, DbError> {
    let result = sqlx::query!(
        r#"
        INSERT INTO Item (name, price, user_id, category, description, images, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        "#,
        name,
        price,
        user_id,
        category as Category,
        description,
        Value::from(images),
        location
    )
    .fetch_one(conn)
    .await?;

    Ok(result.id)
}

pub async fn search_items(
    search_string: &str,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<Item>, DbError> {
    let items = sqlx::query_as!(
        Item,
        r#"
        SELECT
            item.id as "id!", 
            item.name as "name!", 
            item.price as "price!", 
            item.user_id as "user_id!", 
            item.category::TEXT AS "category!",
            item.status::TEXT AS "status!",
            item.created_at as "created_at!", 
            item.description as "description",
            item.location as "location",
            item.updated_at as "updated_at!",
            item.images as "images!"
        FROM search_item_idx.search(
        $1,
        fuzzy_fields => 'description,name',
        distance => 1
        ) AS item
        WHERE item.status = 'active'
        LIMIT 10;
        "#,
        search_string
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn delete_item_by_id(
    id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        DELETE FROM Item
        WHERE id = $1
        "#,
        id
    )
    .execute(conn)
    .await?;

    Ok(())
}