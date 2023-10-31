use actix_web::{get, web, HttpResponse, Responder};

use crate::{model::db_model::DbPool, authentication::jwt::AuthenticationGuard, repository::saved_item_repository::fetch_saved_items_by_user_id};

#[get("/")]
async fn get_saved_items_by_user_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let item = fetch_saved_items_by_user_id(user_id, pool.as_ref()).await;

    match item {
        Ok(item) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": item})),
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to fetch saved items for user {user_id}"));
            tracing::error!("Error message: {}\n", err);
            match err {
            crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "message": format!("API: Could not find saved items for {user_id}" )})),
            _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
        }
    }
}
