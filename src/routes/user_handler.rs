use actix_web::{get, web, HttpResponse, Responder};

use crate::{
    authentication::jwt::AuthenticationGuard,
    model::db_model::DbPool,
    repository::user_repository::{self},
};

#[get("/me")]
async fn get_me_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(_) => {
            tracing::error!("API: Failed to fetch user with id: {}", user_id);
            HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "message": "User not found"}))
        }
        Ok(user) => {
            tracing::info!("API: User with id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": user}))
        }
            ,
    }
}

#[get("/{id}")]
async fn get_user_by_id_handler(
    path: web::Path<i64>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = path.into_inner();
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(_) => {
            tracing::error!("API: Failed to fetch user with id: {}", user_id);
            HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "message": "User not found"}))
        }
        Ok(user) => {
            tracing::info!("API: User with id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": user}))
        }
            ,
    }
}