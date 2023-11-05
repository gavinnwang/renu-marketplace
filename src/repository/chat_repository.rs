use sqlx::{Executor, MySql};

use crate::{error::DbError, model::chat_model::{ChatGroup, RawChatGroup}};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let raw_groups = sqlx::query_as!(
        RawChatGroup,
        r#"
            SELECT 
                ItemChat.id AS chat_id, 
                item_id, 
                buyer_id, 
                Item.user_id AS seller_id,
                name AS item_name, 
                price, 
                category, 
                Item.created_at, 
                Item.updated_at, 
                description, 
                status 
            FROM ItemChat
            JOIN Item ON ItemChat.item_id = Item.id
            WHERE Item.user_id = ?;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    raw_groups.iter().map(|raw_group| {
        Ok(ChatGroup {
            chat_id: raw_group.chat_id,
            item_id: raw_group.item_id,
            buyer_id: raw_group.buyer_id,
            seller_id: raw_group.seller_id,
            item_name: raw_group.item_name.clone(),
            price: raw_group.price,
            category: raw_group.category.clone(),
            description: raw_group.description.clone(),
            status: raw_group.status.clone(),
            created_at: raw_group.created_at.into(),
            updated_at: raw_group.updated_at.into(),
        })
    }).collect::<Result<Vec<ChatGroup>, DbError>>()
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
            item_id,
            buyer_id,
            User.id AS seller_id, 
            Item.name AS item_name, 
            price, 
            category, 
            Item.created_at, 
            Item.updated_at, 
            description, 
            status
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON Item.user_id = User.id
        WHERE ItemChat.buyer_id = ?;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    raw_groups.iter().map(|raw_group| {
        Ok(ChatGroup {
            chat_id: raw_group.chat_id,
            item_id: raw_group.item_id,
            buyer_id: raw_group.buyer_id,
            seller_id: raw_group.seller_id,
            item_name: raw_group.item_name.clone(),
            price: raw_group.price,
            category: raw_group.category.clone(),
            description: raw_group.description.clone(),
            status: raw_group.status.clone(),
            created_at: raw_group.created_at.into(),
            updated_at: raw_group.updated_at.into(),
        })
    }).collect::<Result<Vec<ChatGroup>, DbError>>()
}

