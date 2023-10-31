use actix_web::{get, web, HttpResponse, Responder};

use crate::{
    authentication::jwt::AuthenticationGuard,
    model::db_model::DbPool,
    repository::{user_repository::{self}, item_repository},
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

#[derive(serde::Deserialize)]
struct StatusQuery {
    status: Option<String>,
}

#[get("/{id}/items")]
async fn get_items_by_user_id_and_status_handler(
    path: web::Path<i64>,
    query: Option<web::Query<StatusQuery>>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = path.into_inner();

    match user_repository::fetch_user_by_id(pool.as_ref(), user_id).await {
        Err(_) => {
            tracing::error!("API: Failed to fetch user with id: {} when getting items by user id", user_id);
            return HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "message": "User not found"}));
        }
        Ok(_) => {}
    }

    let status = match query {
        Some(query) => query.status.to_owned().unwrap_or("ACTIVE".to_string()),
        None => "ACTIVE".to_string(),
    };
    let items = item_repository::fetch_items_by_user_id_and_status(user_id, status.clone(), pool.as_ref()).await;

    match items {
        Ok(items) => {
            tracing::info!("API: Items with user_id {} and status {} successfully fetched", user_id, status);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch items with user_id {} and status {}", user_id, status);
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}

#[get("/me/items")]
async fn get_items_by_me_by_status_handler(
    auth_guard: AuthenticationGuard,
    query: Option<web::Query<StatusQuery>>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let status = match query {
        Some(query) => query.status.to_owned().unwrap_or("ACTIVE".to_string()),
        None => "ACTIVE".to_string(),
    };
    let items = item_repository::fetch_items_by_user_id_and_status(user_id, status.clone(), pool.as_ref()).await;

    match items {
        Ok(items) => {
            tracing::info!("API: Items with user_id {} and status {} successfully fetched", user_id, status);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch items with user_id {} and status {}", user_id, status);
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}
