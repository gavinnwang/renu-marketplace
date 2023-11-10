use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::chat_model::{ChatGroup, ChatMessage, ChatWindow, RawChatGroup, RawChatMessage},
};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i32,
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
            Message.content AS last_message_content,
            Message.created_at AS last_message_sent_at,
            Item.category AS item_category, 
            Item.description AS item_description,
            Item.status AS item_status
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON User.id = ItemChat.buyer_id
        JOIN (
            SELECT content, created_at, chat_id 
            FROM Message 
            ORDER BY created_at DESC
            LIMIT 1
        ) AS Message ON Message.chat_id = ItemChat.id
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
            last_message_content: raw_group.last_message_content,
            last_message_sent_at: raw_group.last_message_sent_at.into(),
        })
        .collect())
}

pub async fn fetch_chat_groups_by_buyer_id(
    user_id: i32,
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
            Message.content AS last_message_content,
            Message.created_at AS last_message_sent_at,
            Item.category AS item_category, 
            Item.description AS item_description,
            Item.status AS item_status
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON Item.user_id = User.id
        JOIN (
            SELECT content, created_at, chat_id 
            FROM Message 
            ORDER BY created_at DESC
            LIMIT 1
        ) AS Message ON Message.chat_id = ItemChat.id
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

            last_message_content: raw_group.last_message_content,
            last_message_sent_at: raw_group.last_message_sent_at.into(),
        })
        .collect())
}

pub async fn fetch_chat_window_by_chat_id(
    user_id: i32,
    chat_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<ChatWindow, DbError> {
    let window = sqlx::query_as!(
        ChatWindow,
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
            Item.status AS item_status
        FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id
        JOIN User ON Item.user_id = User.id
        WHERE ItemChat.id = ? AND (ItemChat.buyer_id = ? OR Item.user_id = ?);
        "#,
        chat_id,
        user_id,
        user_id
    )
    .fetch_one(conn)
    .await?;

    Ok(window)
}

pub async fn fetch_chat_messages_by_chat_id(
    user_id: i32,
    chat_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatMessage>, DbError> {
    let messages = sqlx::query_as!(
        RawChatMessage,
        r#"
        SELECT
            Message.id,
            Message.chat_id,
            Message.sender_id,
            Message.content,
            Message.created_at AS sent_at,
            CASE
                WHEN Message.sender_id = ? THEN 1
                ELSE 0
            END
                AS from_me
        FROM Message
        WHERE Message.chat_id = ?
        ORDER BY Message.created_at ASC;
        "#,
        user_id,
        chat_id 
    )
    .fetch_all(conn)
    .await?;

    Ok(messages
        .into_iter()
        .map(|message| ChatMessage {
            id: message.id,
            chat_id: message.chat_id,
            sender_id: message.sender_id,
            content: message.content,
            sent_at: message.sent_at.into(),
            from_me: message.from_me as i32,
        })
        .collect())
}

// check if user_id is part of chat group and returns the other user_id
pub async fn check_if_user_id_is_part_of_chat_group(
    user_id: i32,
    chat_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Option<i32>, DbError> {
    let result = sqlx::query!(
        r#"
        SELECT ItemChat.buyer_id, Item.user_id FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id    
        WHERE ItemChat.id = ?
        "#,
        chat_id
    )
    .fetch_one(conn)
    .await;

    match result {
        Err(sqlx::Error::RowNotFound) => Ok(None),
        Err(err) => Err(err.into()),
        Ok(user_ids) => {
            if user_ids.buyer_id == user_id {
                Ok(Some(user_ids.user_id))
            } else if user_ids.user_id == user_id {
                Ok(Some(user_ids.buyer_id))
            } else {
                Ok(None)
            }
        }
    }
}


pub async fn insert_chat_message(
    user_id: i32,
    chat_id: i32,
    content: &str,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<bool, DbError> {
    let result = sqlx::query!(
        r#"
        INSERT INTO Message (chat_id, sender_id, content)
        VALUES (?, ?, ?);
        "#,
        chat_id,
        user_id,
        content
    )
    .execute(conn)
    .await?;

    Ok(result.rows_affected() == 1)
}
