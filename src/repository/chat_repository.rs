use sqlx::{Executor, Postgres};

use crate::{
    error::DbError,
    model::chat_model::{ChatGroup, ChatMessage},
};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<ChatGroup>, DbError> {
    let chat_groups = sqlx::query_as!(
        ChatGroup,
        r#"
        WITH recent_message AS (
            SELECT
                m.chat_id,
                m.content AS last_message_content,
                m.created_at AS last_message_sent_at,
                ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) AS rn
            FROM
                Message m
        )
        SELECT 
            ic.id AS chat_id, 
            ic.item_id, 
            i.name AS item_name, 
            u.id AS other_user_id,
            u.name AS other_user_name,
            i.price AS item_price, 
            i.images AS item_images,
            rm.last_message_content,
            rm.last_message_sent_at,
            i.category::TEXT AS "item_category!", 
            i.description AS item_description,
            i.status::TEXT AS "item_status!"
        FROM 
            item_chat ic
        JOIN 
            "item" i ON ic.item_id = i.id
        JOIN 
            "user" u ON u.id = i.user_id
        LEFT JOIN
            recent_message rm ON ic.id = rm.chat_id AND rm.rn = 1
        WHERE 
            i.user_id = $1
        ORDER BY rm.last_message_sent_at DESC;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(chat_groups)
}

pub async fn fetch_chat_groups_by_buyer_id(
    user_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<ChatGroup>, DbError> {
    let chat_groups = sqlx::query_as!(
        ChatGroup,
        r#"
            WITH recent_message AS (
                SELECT
                    m.chat_id,
                    m.content AS last_message_content,
                    m.created_at AS last_message_sent_at,
                    ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) AS rn
                FROM
                    Message m
            )
            SELECT 
                ic.id AS chat_id, 
                ic.item_id, 
                i.name AS item_name, 
                u.id AS other_user_id,
                u.name AS other_user_name,
                i.price AS item_price, 
                i.images AS item_images,
                rm.last_message_content,
                rm.last_message_sent_at,
                i.category::TEXT AS "item_category!", 
                i.description AS item_description,
                i.status::TEXT AS "item_status!"
            FROM 
                item_chat ic
            JOIN 
                "item" i ON ic.item_id = i.id
            JOIN 
                "user" u ON u.id = i.user_id
            LEFT JOIN
                recent_message rm ON ic.id = rm.chat_id AND rm.rn = 1
            WHERE 
                ic.buyer_id = $1
            ORDER BY rm.last_message_sent_at DESC;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(chat_groups)
}

pub async fn fetch_chat_messages_by_chat_id(
    user_id: i32,
    chat_id: i32,
    offset: i32,
    limit: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<ChatMessage>, DbError> {
    let records = sqlx::query!(
        r#"
        SELECT
            Message.id,
            Message.chat_id,
            Message.sender_id,
            Message.content,
            Message.created_at AS sent_at,
            CASE
                WHEN Message.sender_id = $1 THEN 1
                ELSE 0
            END AS "from_me!"
        FROM Message
        WHERE Message.chat_id = $2
        ORDER BY Message.created_at DESC
        LIMIT $3
        OFFSET $4;
    "#,
        user_id,
        chat_id,
        limit as i64,
        offset as i64
    )
    .fetch_all(conn)
    .await?;

    let messaegs = records
        .into_iter()
        .map(|message| ChatMessage {
            id: message.id,
            chat_id: message.chat_id,
            sender_id: message.sender_id,
            content: message.content,
            sent_at: message.sent_at.into(),
            from_me: message.from_me,
        })
        .collect();

    Ok(messaegs)
}

// check if user_id is part of chat group and returns the other user_id
pub async fn check_if_user_id_is_part_of_chat_group(
    user_id: i32,
    chat_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<i32>, DbError> {
    let record = sqlx::query!(
        r#"
        SELECT item_chat.buyer_id, item.user_id 
        FROM item_chat 
        JOIN item ON item_chat.item_id = item.id    
        WHERE item_chat.id = $1 AND (item_chat.buyer_id = $2 OR item.user_id = $3);"#,
        chat_id,
        user_id,
        user_id
    )
    .fetch_one(conn)
    .await;

    match record {
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
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<bool, DbError> {
    let result = sqlx::query!(
        r#"
        INSERT INTO Message (chat_id, sender_id, content)
        VALUES ($1, $2, $3);
        "#,
        chat_id,
        user_id,
        content
    )
    .execute(conn)
    .await?;

    Ok(result.rows_affected() == 1)
}

pub async fn increment_unread_count_based_on_sender_id(
    chat_id: i32,
    sender_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    sqlx::query!(
        r#"
        UPDATE item_chat
        SET 
            seller_unread_count = CASE
                WHEN buyer_id = $1 THEN seller_unread_count + 1
                ELSE seller_unread_count
            END,
            buyer_unread_count = CASE
                WHEN buyer_id != $2 THEN buyer_unread_count + 1
                ELSE buyer_unread_count
            END
        WHERE id = $3;
        "#,
        sender_id,
        sender_id,
        chat_id
    )
    .execute(conn)
    .await?;

    Ok(())
}

// fetch the item info by chat id and if there is a chat room between the user and other user regarding this item
pub async fn fetch_chat_id_by_item_id(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<i32>, DbError> {
    let record = sqlx::query!(
        r#"
        SELECT
        item_chat.id
        FROM item_chat
        WHERE item_chat.item_id = $1 AND (item_chat.buyer_id = $2 OR item_chat.buyer_id = $3);
        "#,
        item_id,
        user_id,
        user_id
    )
    .fetch_one(conn)
    .await;

    match record {
        Err(sqlx::Error::RowNotFound) => Ok(None),
        Err(err) => Err(err.into()),
        Ok(record) => {
            if record.id == 0 {
                Ok(None)
            } else {
                Ok(Some(record.id))
            }
        }
    }
}

pub async fn insert_chat_room(
    user_id: i32,
    item_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<i32, DbError> {
    let result = sqlx::query!(
        r#"
        INSERT INTO item_chat (item_id, buyer_id)
        VALUES ($1, $2)
        RETURNING id;
        "#,
        item_id,
        user_id
    )
    .fetch_one(conn)
    .await?;

    Ok(result.id)
}
