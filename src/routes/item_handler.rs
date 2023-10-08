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
            HttpResponse::InternalServerError().json(
                serde_json::json!({"status": "fail", "message": "API: Something went wrong "}),
            )
        }
    }
}
