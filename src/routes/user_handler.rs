use actix_web::{get, web, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    model::item_model::ItemStatus,
    repository::{
        item_repository,
        user_repository::{self},
    },
};

#[get("/me")]
async fn get_me_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(err) => {
            tracing::error!(
                "API: Failed to fetch user with id: {} with error message {}",
                user_id,
                err
            );
            HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "data": "User not found"}))
        }
        Ok(user) => {
            tracing::info!("API: User with id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": user}))
        }
    }
}

#[get("/{id}")]
async fn get_user_by_id_handler(path: web::Path<i32>, pool: web::Data<PgPool>) -> impl Responder {
    let user_id = path.into_inner();
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(_) => {
            tracing::error!("API: Failed to fetch user with id: {}", user_id);
            HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "data": "User not found"}))
        }
        Ok(user) => {
            tracing::info!("API: User with id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": user}))
        }
    }
}

#[derive(serde::Deserialize)]
struct StatusQuery {
    status: String,
}

#[get("/{id}/items")]
async fn get_items_by_user_id_and_status_handler(
    path: web::Path<i32>,
    query: Option<web::Query<StatusQuery>>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = path.into_inner();

    match user_repository::fetch_user_by_id(pool.as_ref(), user_id).await {
        Err(_) => {
            tracing::error!(
                "API: Failed to fetch user with id: {} when getting items by user id",
                user_id
            );
            return HttpResponse::NotFound()
                .json(serde_json::json!({"status": "fail", "data": "User not found"}));
        }
        Ok(_) => {}
    }

    let items = match query {
        Some(query) => {
            let status = match ItemStatus::from_str(&query.status) {
                Ok(status) => status,
                Err(_) => {
                    return HttpResponse::BadRequest().json(
                        serde_json::json!({"status": "fail", "data": "API: Invalid status"}),
                    )
                }
            };

            item_repository::fetch_items_by_user_id_and_status(user_id, status, pool.as_ref()).await
        }
        None => item_repository::fetch_items_by_user_id(user_id, pool.as_ref()).await,
    };

    match items {
        Ok(items) => {
            tracing::info!("API: Items with user_id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch items with user_id {}", user_id);
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

#[get("/me/items")]
async fn get_items_by_me_by_status_handler(
    auth_guard: AuthenticationGuard,
    query: Option<web::Query<StatusQuery>>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let items = match query {
        Some(query) => {
            let status = match ItemStatus::from_str(&query.status) {
                Ok(status) => status,
                Err(_) => {
                    return HttpResponse::BadRequest().json(
                        serde_json::json!({"status": "fail", "data": "API: Invalid status"}),
                    )
                }
            };

            item_repository::fetch_items_by_user_id_and_status(user_id, status, pool.as_ref()).await
        }
        None => item_repository::fetch_items_by_user_id(user_id, pool.as_ref()).await,
    };

    match items {
        Ok(items) => {
            tracing::info!("API: Items with user_id {} successfully fetched", user_id);
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch items with  user id {}", user_id);
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}
