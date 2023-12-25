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

    // let user = PartialUser {
    //     id: user.id as i32,
    //     name: user.name,
    //     email: user.email,
    //     profile_image: user.profile_image,
    //     active_listing_count: user.active_listing_count.unwrap_or(0),
    //     sales_done_count: user.sales_done_count.unwrap_or(0),
    // };

    Ok(user)
}

pub async fn fetch_user_id_by_email(
    conn: impl Executor<'_, Database = Postgres>,
    email: String,
) -> Result<i32, DbError> {
    let user_id = sqlx::query!(r#"SELECT id FROM "user" WHERE email = $1"#, email)
        .fetch_one(conn)
        .await?;

    Ok(user_id.id as i32)
}

pub async fn add_user(
    conn: impl Executor<'_, Database = Postgres>,
    name: &String,
    email: &String,
    profile_image: &String,
) -> Result<i32, DbError> {
    let record = sqlx::query!(
        r#"INSERT INTO "user" (name, email, profile_image) VALUES ($1, $2, $3) RETURNING id"#,
        name,
        email,
        profile_image
    )
    .fetch_one(conn)
    .await?;

    Ok(record.id as i32)
}
