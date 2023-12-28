use actix_web::{get, web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;

use crate::repository::item_repository;

#[derive(Deserialize, Debug)]
pub struct SearchItemsQuery {
    query: String,
}

#[tracing::instrument(skip(pool))]
#[get("/items")]
async fn search_items_handler(
    pool: web::Data<PgPool>,
    query: web::Query<SearchItemsQuery>,
) -> impl Responder {
    tracing::info!("search_items_handler called");
    let items = item_repository::search_items(&query.query, pool.as_ref()).await;

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch items: {err}");
            HttpResponse::InternalServerError().json(err.to_string())
        }
    }
}
