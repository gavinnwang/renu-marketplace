use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::chat_model::{ChatGroup, ChatMessage, ChatWindow, RawChatMessage},
};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let raw_groups = sqlx::query!(
        r#"
        SELECT 
        ic.id AS chat_id, 
        ic.item_id, 
        i.name AS item_name, 
        u.id AS other_user_id,
        u.name AS other_user_name,
        i.price AS item_price, 
        (SELECT ii.url FROM ItemImage ii WHERE ii.item_id = i.id LIMIT 1) AS item_image,
        m.content AS last_message_content,
        m.created_at AS last_message_sent_at,
        i.category AS item_category, 
        i.description AS item_description,
        i.status AS item_status
    FROM 
        ItemChat ic
    JOIN 
        Item i ON ic.item_id = i.id
    JOIN 
        User u ON u.id = ic.buyer_id
    INNER JOIN 
        (SELECT chat_id, MAX(created_at) AS max_created_at FROM Message GROUP BY chat_id) AS latest_msg ON latest_msg.chat_id = ic.id
    LEFT JOIN 
        Message m ON m.chat_id = ic.id AND m.created_at = latest_msg.max_created_at
    WHERE 
        i.user_id = ?;
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
            last_message_sent_at: match raw_group.last_message_sent_at {
                Some(time) => {
                    let time: std::time::SystemTime = time.into();
                    Some(time.into())
                },
                None => None,
            },
        })
        .collect())
}

pub async fn fetch_chat_groups_by_buyer_id(
    user_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let raw_groups = sqlx::query!(
        r#"
    SELECT 
        ic.id AS chat_id, 
        ic.item_id, 
        i.name AS item_name, 
        u.id AS other_user_id,
        u.name AS other_user_name,
        i.price AS item_price, 
        (SELECT ii.url FROM ItemImage ii WHERE ii.item_id = i.id LIMIT 1) AS item_image,
        m.content AS last_message_content,
        m.created_at AS last_message_sent_at,
        i.category AS item_category, 
        i.description AS item_description,
        i.status AS item_status
    FROM 
        ItemChat ic
    JOIN 
        Item i ON ic.item_id = i.id
    JOIN 
        User u ON u.id = ic.buyer_id
    INNER JOIN 
        (SELECT chat_id, MAX(created_at) AS max_created_at FROM Message GROUP BY chat_id) AS latest_msg ON latest_msg.chat_id = ic.id
    LEFT JOIN 
        Message m ON m.chat_id = ic.id AND m.created_at = latest_msg.max_created_at
    WHERE 
        ic.buyer_id = ?;
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
            last_message_sent_at: match raw_group.last_message_sent_at {
                Some(time) => {
                    let time: std::time::SystemTime = time.into();
                    Some(time.into())
                },
                None => None,
            },
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
    offset: i32,
    limit: i32,
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
        ORDER BY Message.created_at DESC
        LIMIT ?
        OFFSET ?;
        "#,
        user_id,
        chat_id,
        limit,
        offset
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

#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
struct UserInChatGroup {
    buyer_id: i32,
    user_id: i32,
}

// check if user_id is part of chat group and returns the other user_id
pub async fn check_if_user_id_is_part_of_chat_group(
    user_id: i32,
    chat_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Option<i32>, DbError> {
    let users_in_chat = sqlx::query_as!(
        UserInChatGroup,
        r#"
        SELECT ItemChat.buyer_id, Item.user_id FROM ItemChat
        JOIN Item ON ItemChat.item_id = Item.id    
        WHERE ItemChat.id = ? AND (ItemChat.buyer_id = ? OR Item.user_id = ?);
        "#,
        chat_id,
        user_id,
        user_id
    )
    .fetch_one(conn)
    .await;

    match users_in_chat {
        Err(sqlx::Error::RowNotFound) => Ok(None),
        Err(err) => Err(err.into()),
        Ok(users_in_chat) => {
            if users_in_chat.user_id == user_id {
                Ok(Some(users_in_chat.buyer_id))
            } else if users_in_chat.buyer_id == user_id {
                Ok(Some(users_in_chat.user_id))
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
#[derive(Debug, sqlx::FromRow, Deserialize, Serialize)]
struct ChatId {
    id: i32,
}
// fetch the item info by chat id and if there is a chat room between the user and other user regarding this item
pub async fn fetch_chat_id_by_item_id(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Option<i32>, DbError> {
    let result = sqlx::query_as!(
        ChatId,
        r#"
        SELECT
            ItemChat.id
        FROM ItemChat
        WHERE ItemChat.item_id = ? AND (ItemChat.buyer_id = ? OR ItemChat.buyer_id = ?);
        "#,
        item_id,
        user_id,
        user_id
    )
    .fetch_one(conn)
    .await;

    match result {
        Err(sqlx::Error::RowNotFound) => Ok(None),
        Err(err) => Err(err.into()),
        Ok(chat_id) => {
            if chat_id.id == 0 {
                Ok(None)
            } else {
                Ok(Some(chat_id.id))
            }
        }
    }
}

pub async fn insert_chat_room(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<i32, DbError> {
    let result = sqlx::query!(
        r#"
        INSERT INTO ItemChat (item_id, buyer_id)
        VALUES (?, ?);
        "#,
        item_id,
        user_id
    )
    .execute(conn)
    .await?;

    Ok(result.last_insert_id() as i32)
}
