use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    repository::saved_item_repository::{fetch_saved_items_by_user_id, insert_saved_item},
};

#[tracing::instrument(skip_all, fields(user_id = %auth_guard.user_id))]
#[get("/")]
async fn get_saved_items_by_user_id(
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
    item_id: i32,
}

#[tracing::instrument(skip_all, fields(user_id = %auth_guard.user_id))]
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
        Ok(_) => HttpResponse::Ok()
            .json("Saved item successfully"),
        Err(err) => {
            tracing::error!("Failed to save item: {err}");
            match err {
            crate::error::DbError::NotFound => HttpResponse::NotFound().json("Could not find item"),
            _ => HttpResponse::InternalServerError().json("Something went wrong"),
        }
        }
    }
}
