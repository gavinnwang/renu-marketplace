use sqlx::{Executor, MySql};

use crate::{
    error::DbError,
    model::user_model::{NewUser, PartialUser},
};
// use chrono::{DateTime, Local};

pub async fn fetch_user_by_id(
    conn: impl Executor<'_, Database = MySql>,
    id: i64,
) -> Result<PartialUser, DbError> {
    let user = sqlx::query_as!(
        PartialUser,
        r#"SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.profile_image,
        CAST(COALESCE(SUM(CASE WHEN i.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS SIGNED) AS active_listing_count,
        CAST(COALESCE(SUM(CASE WHEN i.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS SIGNED) AS sales_done_count
        FROM 
            User u
        INNER JOIN 
            Item i ON u.id = i.user_id
        WHERE 
            u.id = ?
        GROUP BY 
            u.id;"#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(user)
}

pub async fn fetch_user_id_by_email(
    conn: impl Executor<'_, Database = MySql>,
    email: String,
) -> Result<i64, DbError> {
    let user_id = sqlx::query!(
        r#"SELECT id FROM User WHERE email = ?"#,
        email
    )
    .fetch_one(conn)
    .await?;

    Ok(user_id.id as i64)
}

// pub async fn fetch_user_by_email(
//     conn: impl Executor<'_, Database = MySql>,
//     email: String,
// ) -> Result<PartialUser, DbError> {
//     let user = sqlx::query_as!(
//         PartialUser,
//         r#"SELECT 
//         u.id, 
//         u.name, 
//         u.email, 
//         u.profile_image,
//         CAST(COALESCE(SUM(CASE WHEN i.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS SIGNED) AS active_listing_count,
//         CAST(COALESCE(SUM(CASE WHEN i.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS SIGNED) AS sales_done_count
//         FROM 
//             User u
//         INNER JOIN 
//             Item i ON u.id = i.user_id
//         WHERE 
//             u.email = ?
//         GROUP BY 
//             u.id;"#,     
//         email
//     )
//     .fetch_one(conn)
//     .await?;

//     Ok(user)
// }

pub async fn add_user(
    conn: impl Executor<'_, Database = MySql>,
    new_user: &NewUser,
) -> Result<i64, DbError> {
    tracing::info!(
        "User repository: Adding user with name {}\n",
        &new_user.name
    );

    let id = sqlx::query!(
        r#"INSERT INTO User (name, email) VALUES (?, ?)"#,
        new_user.name,
        new_user.email,
    )
    .execute(conn)
    .await?
    .last_insert_id();

    Ok(id as i64)
}
