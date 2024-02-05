use sqlx::{Executor, Postgres};

use crate::{error::DbError, model::user_model::User};

pub async fn fetch_user_by_id(
    conn: impl Executor<'_, Database = Postgres>,
    id: i32,
) -> Result<User, DbError> {
    let user = sqlx::query_as!(
        User,
        r#"SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.profile_image,
            u.role::TEXT AS "role!",
            u.created_at, 
            u.updated_at,
            u.verified,
            COUNT(*) FILTER (WHERE i.status = 'active') AS "active_listing_count!",
            COUNT(*) FILTER (WHERE i.status = 'inactive') AS "sales_done_count!"
        FROM "user" u
        LEFT JOIN "item" i ON u.id = i.user_id
        WHERE u.id = $1
        GROUP BY u.id;"#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}

pub async fn fetch_user_id_by_email(
    conn: impl Executor<'_, Database = Postgres>,
    email: &str,
) -> Result<i32, DbError> {
    let user_id = sqlx::query!(r#"SELECT id FROM "user" WHERE email = $1"#, email)
        .fetch_one(conn)
        .await?;

    Ok(user_id.id as i32)
}

pub async fn create_user(
    conn: impl Executor<'_, Database = Postgres>,
    name: &str,
    email: &str,
    profile_image: Option<&str>,
    verified: bool,
) -> Result<i32, DbError> {
    let record = sqlx::query!(
        r#"INSERT INTO "user" (name, email, profile_image, verified) VALUES ($1, $2, $3, $4) RETURNING id"#,
        name,
        email,
        profile_image,
        verified
    )
    .fetch_one(conn)
    .await?;

    Ok(record.id as i32)
}

pub async fn post_push_token(
    user_id: i32,
    push_token: &str,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), DbError> {
    let result = sqlx::query!(
        r#"UPDATE "user" SET push_token = $1 WHERE id = $2"#,
        push_token,
        user_id
    )
    .execute(conn)
    .await?;

    match result.rows_affected() {
        0 => Err(DbError::NotFound),
        _ => Ok(()),
    }
}

pub async fn delete_user(
    conn: impl Executor<'_, Database = Postgres>,
    id: i32,
) -> Result<(), DbError> {
    let result = sqlx::query!(r#"DELETE FROM "user" WHERE id = $1"#, id)
        .execute(conn)
        .await?;

    match result.rows_affected() {
        0 => Err(DbError::NotFound),
        _ => Ok(()),
    }
}

pub async fn block_user(
    conn: impl Executor<'_, Database = Postgres>,
    blocker_user_id: i32,
    blocked_user_id: i32,
) -> Result<(), DbError> {
    let result = sqlx::query!(
        r#"INSERT INTO "blocked_user" (blocker_user_id, blocked_user_id) VALUES ($1, $2)"#,
        blocker_user_id,
        blocked_user_id
    )
    .execute(conn)
    .await?;

    match result.rows_affected() {
        0 => Err(DbError::NotFound),
        _ => Ok(()),
    }
}
