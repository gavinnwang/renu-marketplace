use sqlx::{Executor, Postgres};

use crate::{
    error::DbError,
    model::item_model::{Category, Item, ItemStatus},
};

pub async fn fetch_items_by_status(
    status: ItemStatus,
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
            item.updated_at,
            item.images as images
        FROM item
        WHERE item.status = $1
        ORDER BY item.created_at DESC
        "#,
        status as ItemStatus
    )
    .fetch_all(conn)
    .await?;

    Ok(items)
}

pub async fn fetch_items_by_category(
    category: Category,
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
            Item.created_at, 
            Item.updated_at,
            Item.images as images
        FROM Item 
        WHERE Item.category = $1 AND Item.status = 'active'
        ORDER BY Item.created_at DESC
        "#,
        category as Category
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

// fetch the item info by chat id and if there is a chat room between the user and other user regarding this item
// pub async fn fetch_item_and_potential_chat_id_by_item_id(
//     user_id: i32,
//     item_id: i32,
//     conn: impl Executor<'_, Database = Postgres>,
// ) -> Result<ItemWithChatId, DbError> {
//     let raw_item = sqlx::query_as!(
//         RawItemWithChatId,
//         r#"
//         SELECT
//             Item.id,
//             Item.name,
//             Item.price,
//             Item.user_id,
//             Item.category,
//             Item.status,
//             Item.description,
//             Item.created_at,
//             Item.updated_at,
//             ItemChat.id as chat_id,
//             GROUP_CONCAT(ItemImage.url) AS item_images
//         FROM Item
//         JOIN ItemImage ON Item.id = ItemImage.item_id
//         LEFT JOIN ItemChat ON ItemChat.item_id = Item.id AND (ItemChat.buyer_id = ? OR Item.user_id = ?)
//         WHERE Item.id = ?
//         GROUP BY Item.id, Item.name, Item.price, Item.user_id, Item.category, Item.status, Item.description, Item.created_at, Item.updated_at, ItemChat.id;
//         "#,
//         user_id,
//         user_id,
//         item_id
//     ).fetch_one(conn).await?;

//     Ok(ItemWithChatId {
//         id: raw_item.id,
//         name: raw_item.name,
//         price: raw_item.price,
//         item_images: match raw_item.item_images {
//             Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
//             None => Vec::new(),
//         },
//         category: raw_item.category,
//         status: raw_item.status,
//         user_id: raw_item.user_id,
//         description: raw_item.description,
//         created_at: raw_item.created_at.into(),
//         updated_at: raw_item.updated_at.into(),
//         chat_id: raw_item.chat_id,
//     })
// }
