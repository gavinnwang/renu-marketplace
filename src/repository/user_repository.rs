use sqlx::{Executor, MySql};

use crate::{model::user_model::User, error::DbError};

pub struct PartialUser {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime<Utc>, 
}

pub async fn fetch_user_by_id(conn: impl Executor<'_, Database = MySql>, id: &i32) -> Result<User, DbError> {
    let user = sqlx::query_as!(
        PartialUser,
        r#"SELECT id, name, created_at FROM User WHERE id = ?"#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}