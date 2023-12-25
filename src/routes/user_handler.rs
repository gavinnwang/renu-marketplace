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

#[tracing::instrument(skip_all, fields(user_id = %auth_guard.user_id))]
#[get("/me")]
async fn get_me_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(err) => {
            tracing::error!("Failed to fetch user {err}");
            HttpResponse::NotFound().json("User not found")
        }
        Ok(user) => HttpResponse::Ok().json(user),
    }
}

#[tracing::instrument(skip(pool))]
#[get("/{id}")]
async fn get_user_by_id_handler(path: web::Path<i32>, pool: web::Data<PgPool>) -> impl Responder {
    let user_id = path.into_inner();
    let user = user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

    match user {
        Err(err) => {
            tracing::error!("Failed to fetch user {err}");
            HttpResponse::NotFound().json("User not found")
        }
        Ok(user) => HttpResponse::Ok().json(user),
    }
}

#[derive(serde::Deserialize, Debug)]
struct StatusQuery {
    status: String,
}

#[tracing::instrument(skip(pool))]
#[get("/{id}/items")]
async fn get_active_items_by_user_id(
    path: web::Path<i32>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = path.into_inner();

    match user_repository::fetch_user_by_id(pool.as_ref(), user_id).await {
        Err(err) => {
            tracing::error!("Failed to fetch user {err}");
            return HttpResponse::NotFound().json("User not found");
        }
        Ok(_) => {}
    }

    let items = item_repository::fetch_items_by_user_id_and_status(
        user_id,
        ItemStatus::Active,
        pool.as_ref(),
    )
    .await;

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch items: {err}");
            HttpResponse::InternalServerError().json("Something went wrong")
        }
    }
}

#[tracing::instrument(skip(auth_guard, pool), fields(user_id = %auth_guard.user_id))]
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
                Err(_) => return HttpResponse::BadRequest().json("Invalid status"),
            };

            item_repository::fetch_items_by_user_id_and_status(user_id, status, pool.as_ref()).await
        }
        None => item_repository::fetch_items_by_user_id(user_id, pool.as_ref()).await,
    };

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch items: {err}");
            HttpResponse::InternalServerError().json("Something went wrong")
        }
    }
}
