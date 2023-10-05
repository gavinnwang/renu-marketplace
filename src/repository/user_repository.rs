use sqlx::{Executor, MySql};

use crate::error::DbError;

pub struct PartialUser {
    pub id: i32,
    pub name: String,
}

pub async fn fetch_user_by_id(conn: impl Executor<'_, Database = MySql>, id: &str) -> Result<PartialUser, DbError> {
    let user = sqlx::query_as!(
        PartialUser,
        r#"SELECT id, name FROM User WHERE id = ?"#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}