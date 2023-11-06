use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::chat_model::{ChatGroup, RawChatGroup},
};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let raw_groups = sqlx::query_as!(
        RawChatGroup,
        r#"
        SELECT 
            ItemChat.id AS chat_id, 
            ItemChat.item_id, 
            Item.name AS item_name, 
            User.id AS other_user_id,
            User.name AS other_user_name,
            Item.price AS item_price, 
            (SELECT url FROM ItemImage WHERE ItemImage.item_id = Item.id LIMIT 1) AS item_image,
            Item.category AS item_category, 
            Item.description AS item_description,
            Item.status AS item_status,
            Item.created_at, 
            Item.updated_at
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON User.id = ItemChat.buyer_id
        WHERE Item.user_id = ?;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(raw_groups
        .into_iter()
        .map(|raw_group| ChatGroup {
            chat_id: raw_group.chat_id,
            item_id: raw_group.item_id,
            other_user_id: raw_group.other_user_id,
            other_user_name: raw_group.other_user_name,
            item_name: raw_group.item_name,
            item_price: raw_group.item_price,
            item_category: raw_group.item_category,
            item_description: raw_group.item_description,
            item_status: raw_group.item_status,
            item_image: raw_group.item_image,
            created_at: raw_group.created_at.into(),
            updated_at: raw_group.updated_at.into(),
        })
        .collect())
}

pub async fn fetch_chat_groups_by_buyer_id(
    user_id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let raw_groups = sqlx::query_as!(
        RawChatGroup,
        r#"
        SELECT 
            ItemChat.id AS chat_id, 
            ItemChat.item_id, 
            Item.name AS item_name, 
            User.id AS other_user_id,
            User.name AS other_user_name,
            Item.price AS item_price, 
            (SELECT url FROM ItemImage WHERE ItemImage.item_id = Item.id LIMIT 1) AS item_image,
            Item.category AS item_category, 
            Item.description AS item_description,
            Item.status AS item_status,
            Item.created_at, 
            Item.updated_at
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON Item.user_id = User.id
        WHERE ItemChat.buyer_id = ?;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(raw_groups
        .into_iter()
        .map(|raw_group| ChatGroup {
            chat_id: raw_group.chat_id,
            item_id: raw_group.item_id,
            other_user_id: raw_group.other_user_id,
            other_user_name: raw_group.other_user_name,
            item_name: raw_group.item_name,
            item_price: raw_group.item_price,
            item_category: raw_group.item_category,
            item_description: raw_group.item_description,
            item_status: raw_group.item_status,
            item_image: raw_group.item_image,
            created_at: raw_group.created_at.into(),
            updated_at: raw_group.updated_at.into(),
        })
        .collect())
}
