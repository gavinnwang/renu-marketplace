use actix_web::{get, web, HttpResponse, Responder};

use crate::{model::db_model::DbPool, repository::item_repository};

#[get("/")]
async fn get_items_handler(pool: web::Data<DbPool>) -> impl Responder {
    let conn = pool.as_ref();
    let items = item_repository::fetch_all_items(conn).await;

    match items {
        Ok(items) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch_all_items");
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}

#[get("/{id}")]
async fn get_item_by_id_handler(path: web::Path<i64>, pool: web::Data<DbPool>) -> impl Responder {
    let item_id = path.into_inner();
    let item = item_repository::fetch_item_by_id(item_id, pool.as_ref()).await;

    match item {
        Ok(item) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": item})),
        Err(e) => {
            tracing::error!("{}", format!("API: Failed to fetch item with id {item_id}"));
            match e {
            crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "message": format!("API: Could not find item with id {item_id}" )})),
            _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
        }
    }
}
