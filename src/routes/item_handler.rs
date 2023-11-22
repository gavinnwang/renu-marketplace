use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    model::item_model::{Category, ItemStatus},
    repository::item_repository,
};


#[get("/")]
async fn get_items_handler(pool: web::Data<PgPool>) -> impl Responder {
    let items = item_repository::fetch_items_by_status(ItemStatus::Active, pool.as_ref()).await;

    match items {
        Ok(items) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(_) => {
            tracing::error!("API: Failed to fetch_all_items\n");
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}

#[get("/{id}")]
async fn get_item_by_id_handler(path: web::Path<i32>, pool: web::Data<PgPool>) -> impl Responder {
    let item_id = path.into_inner();
    let item = item_repository::fetch_item_by_id(item_id, pool.as_ref()).await;

    match item {
        Ok(item) => HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": item})),
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch item with id {item_id}")
            );
            tracing::error!("Error message: {}\n", err);
            match err {
                crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "message": format!("API: Could not find item with id {item_id}" )})),
                _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
            }
        }
    }
}

#[derive(serde::Deserialize)]
struct ItemUpdateBody {
    status: Option<String>,
}

#[post("/{id}")]
async fn update_item_status_handler(
    auth_gaurd: AuthenticationGuard,
    path: web::Path<i32>,
    data: web::Json<ItemUpdateBody>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let item_id = path.into_inner();
    let user_id = auth_gaurd.user_id;

    let item = item_repository::fetch_item_by_id(item_id, pool.as_ref()).await;

    match item {
        Ok(item) => {
            if item.user_id != user_id {
                return HttpResponse::Unauthorized()
                    .json(serde_json::json!({"status": "fail", "message": "API: Unauthorized"}));
            }
        }
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch item with id {item_id}")
            );
            tracing::error!("Error message: {}\n", err);
            match err {
                crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "message": format!("API: Could not find item with id {item_id}" )})),
                _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
            };
        }
    };

    let new_status = match &data.status {
        Some(status) => match ItemStatus::from_str(status.as_str()) {
            Ok(status) => status,
            Err(_) => {
                tracing::error!("API: Failed to parse status");
                return HttpResponse::BadRequest()
                    .json(serde_json::json!({"status": "fail", "message": "API: Invalid status"}));
            }
        },
        None => {
            return HttpResponse::BadRequest()
                .json(serde_json::json!({"status": "fail", "message": "API: Missing status"}))
        }
    };

    let response = item_repository::update_item_status(item_id, new_status, pool.as_ref()).await;

    match response {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"status": "success"})),
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to update item with id {item_id}")
            );
            tracing::error!("Error message: {}\n", err);
            match err {
                crate::error::DbError::NotFound => HttpResponse::NotFound().json(serde_json::json!({"status": "fail", "message": format!("API: Could not find item with id {item_id}" )})),
                _ => HttpResponse::InternalServerError().json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
            }
        }
    }
}

#[get("/category/{category}")]
async fn get_items_by_category_handler(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let category_string = path.into_inner();
    let category = match Category::from_str(&category_string) {
        Ok(category) => category,
        Err(_) => {
            tracing::error!("API: Failed to parse category");
            return HttpResponse::BadRequest()
                .json(serde_json::json!({"status": "fail", "message": "API: Invalid category"}));
        }
    };

    let items = item_repository::fetch_items_by_category(category, pool.as_ref()).await;

    match items {
        Ok(items) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": items}))
        }
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch items with category {category_string}")
            );
            tracing::error!("Error message: {}\n", err);
            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "message": "API: Something went wrong"}))
        }
    }
}
