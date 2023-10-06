use sqlx::{Executor, MySql};

use crate::{error::DbError, model::user_model::NewUser};

pub struct PartialUser {
    pub id: i64,
    pub name: String,
}

pub async fn fetch_user_by_id(
    conn: impl Executor<'_, Database = MySql>,
    id: i64,
) -> Result<PartialUser, DbError> {
    let user = sqlx::query_as!(PartialUser, r#"SELECT id, name FROM User WHERE id = ?"#, id)
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
        r#"SELECT id, name FROM User WHERE email = ?"#,
        email
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}

// insert user and return the id
pub async fn add_user(
    conn: impl Executor<'_, Database = MySql>,
    new_user: &NewUser,
) -> Result<i64, DbError> {  // Change the return type to Result<i64, DbError>
    tracing::info!("Storing user with name {}", &new_user.name);
    
    let id: (i64,) = sqlx::query_as(
        r#"
        INSERT INTO User (name, email)
        VALUES (?, ?);
        SELECT LAST_INSERT_ID();
        "#,
    )
    .bind(&new_user.name)
    .bind(&new_user.email)
    .fetch_one(conn)
    .await?;

    Ok(id.0)
}