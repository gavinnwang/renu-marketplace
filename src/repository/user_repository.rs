use serde::{Deserialize, Serialize};
use sqlx::{Executor, MySql};

use crate::{error::DbError, model::user_model::NewUser};

#[derive(Debug, Deserialize, Serialize)]
pub struct PartialUser {
    pub id: i64,
    pub name: String,
    pub email: String,
}

pub async fn fetch_user_by_id(
    conn: impl Executor<'_, Database = MySql>,
    id: i64,
) -> Result<PartialUser, DbError> {
    let user = sqlx::query_as!(PartialUser, r#"SELECT id, name, email FROM User WHERE id = ?"#, id)
        .fetch_one(conn)
        .await?;

    Ok(user)
}

pub async fn fetch_user_by_email(
    conn: impl Executor<'_, Database = MySql>,
    email: &str,
) -> Result<PartialUser, DbError> {
    let user = sqlx::query_as!(
        PartialUser,
        r#"SELECT id, name, email FROM User WHERE email = ?"#,
        email
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}

pub async fn add_user(
    conn: impl Executor<'_, Database = MySql>,
    new_user: &NewUser,
) -> Result<i64, DbError> {
    tracing::info!("User repository: Adding user with name {}\n", &new_user.name);
    
    let id = sqlx::query!(
        r#"INSERT INTO User (name, email) VALUES ( ?, ?)"#,
        new_user.name,
        new_user.email,
    )
    .execute(conn)
    .await?
    .last_insert_id();

    Ok(id as i64)
}


