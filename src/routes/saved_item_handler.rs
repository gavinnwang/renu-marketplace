use actix_web::{get, web, HttpResponse, Responder, post};
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    repository::saved_item_repository::{fetch_saved_items_by_user_id, insert_saved_item},
};

#[get("/")]
async fn get_saved_items_by_user_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let item = fetch_saved_items_by_user_id(user_id, pool.as_ref()).await;

    match item {
        Ok(item) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": item})),
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch saved items for user {user_id}")
            );
            tracing::error!("Error message: {}\n", err);
            match err {
            crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "data": format!("API: Could not find saved items for {user_id}" )})),
            _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
        }
    }
}

#[derive(serde::Deserialize)]
struct SavedItemRequest {
    item_id: i32,
}

#[post("/")]
async fn post_saved_item(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
    item: web::Json<SavedItemRequest>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let item_id = item.item_id;

    let item = insert_saved_item(user_id, item_id, pool.as_ref()).await;

    match item {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": "API: Saved item successfully"})),
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to save item for user {user_id}")
            );
            tracing::error!("Error message: {}\n", err);
            match err {
            crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "data": format!("API: Could not find item to save for {user_id}" )})),
            _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
        }
    }
}
