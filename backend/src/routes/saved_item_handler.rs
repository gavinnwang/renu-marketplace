use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    error::DbError,
    repository::saved_item_repository::{
        delete_saved_item, fetch_saved_items_by_user_id, get_saved_item_status_by_item_id,
        insert_saved_item,
    },
};

#[tracing::instrument(skip_all, fields(user_id = %auth_guard.user_id))]
#[get("/")]
async fn get_saved_items_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let items = fetch_saved_items_by_user_id(user_id, pool.as_ref()).await;

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch saved items: {err}");
            match err {
                DbError::NotFound => {
                    HttpResponse::NotFound().json("Could not find saved items for user")
                }
                _ => HttpResponse::InternalServerError().json("Something went wrong"),
            }
        }
    }
}

#[tracing::instrument(skip(auth_guard, pool), fields(user_id = %auth_guard.user_id))]
#[get("/{item_id}")]
async fn get_saved_item_status_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let item_id = path.into_inner();

    let items = get_saved_item_status_by_item_id(user_id, item_id, pool.as_ref()).await;

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch saved items: {err}");
            match err {
                crate::error::DbError::NotFound => {
                    HttpResponse::NotFound().json("Could not find saved items for user")
                }
                _ => HttpResponse::InternalServerError().json("Something went wrong"),
            }
        }
    }
}

#[derive(serde::Deserialize, Debug)]
struct SavedItemRequest {
    new_status: bool,
}

#[tracing::instrument(skip(auth_guard, pool), fields(user_id = %auth_guard.user_id))]
#[post("/{item_id}")]
async fn post_saved_item_handler(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
    data: web::Json<SavedItemRequest>,
    path: web::Path<i32>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let item_id = path.into_inner();

    let result = match data.new_status {
        true => insert_saved_item(user_id, item_id, pool.as_ref()).await,
        false => delete_saved_item(user_id, item_id, pool.as_ref()).await,
    };

    match result {
        Ok(_) => HttpResponse::Ok().json(match data.new_status {
            true => "Item saved successfully",
            false => "Item unsaved successfully",
        }),
        Err(err) => {
            tracing::error!("Failed to save item: {err}");
            match err {
                crate::error::DbError::NotFound => {
                    HttpResponse::NotFound().json("Could not find item")
                }
                _ => HttpResponse::InternalServerError().json("Something went wrong"),
            }
        }
    }
}
