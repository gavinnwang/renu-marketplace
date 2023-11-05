use sqlx::{Executor, MySql};

use crate::{error::DbError, model::chat_model::ChatGroup};

pub async fn fetch_chat_groups_by_seller_id(
    user_id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<ChatGroup>, DbError> {
    let groups = sqlx::query_as!(
        ChatGroup,
        r#"
            SELECT ItemChat.id AS chat_id, item_id, buyer_id, name AS item_name, price, category, created_at, updated_at, description, status FROM ItemChat
            JOIN Item ON ItemChat.item_id = Item.id
            WHERE Item.user_id = ?;
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    Ok(groups)
}
