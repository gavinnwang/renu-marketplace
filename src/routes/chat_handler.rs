use actix_web::{get, web, Responder, HttpResponse};

use crate::{authentication::jwt::AuthenticationGuard, model::db_model::DbPool, repository::chat_repository};

#[get("/")]
async fn get_chat_groups_by_seller_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let groups = chat_repository::fetch_chat_groups_by_seller_id(user_id, pool.as_ref()).await;

    match groups {
        Ok(groups) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": groups})),
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to fetch chat groups for user with id {user_id}"));
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}

