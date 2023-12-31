use actix_web::{get, post, web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    authentication::jwt::AuthenticationGuard,
    model::item_model::{Category, ItemStatus},
    repository::item_repository,
};

#[derive(Deserialize, Debug, Default)]
pub struct GetItemQuery {
    pub category: Option<String>,
    pub page: i32,
}

#[tracing::instrument(skip(pool))]
#[get("/")]
async fn get_items_handler(
    pool: web::Data<PgPool>,
    query: web::Query<GetItemQuery>,
) -> impl Responder {
    tracing::info!("called");

    let limit = 25;
    let offset = query.page * limit;

    let items = match &query.category {
        Some(category) if category == "all" => {
            item_repository::fetch_items_by_status(ItemStatus::Active, limit, offset, pool.as_ref())
                .await
        }
        Some(category) => {
            let category = match Category::from_str(category.as_str()) {
                Ok(category) => category,
                Err(_) => {
                    tracing::error!("Failed to parse category");
                    return HttpResponse::BadRequest().json("Invalid category");
                }
            };
            item_repository::fetch_active_items_by_category(category, limit, offset, pool.as_ref())
                .await
        }
        None => {
            item_repository::fetch_items_by_status(ItemStatus::Active, limit, offset, pool.as_ref())
                .await
        }
    };

    match items {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(err) => {
            tracing::error!("Failed to fetch items: {err}");
            HttpResponse::InternalServerError().json(err.to_string())
        }
    }
}

#[tracing::instrument(skip(pool))]
#[get("/{id}")]
async fn get_item_by_id_handler(path: web::Path<i32>, pool: web::Data<PgPool>) -> impl Responder {
    let item_id = path.into_inner();
    let item = item_repository::fetch_item_by_id(item_id, pool.as_ref()).await;

    match item {
        Ok(item) => HttpResponse::Ok().json(item),
        Err(err) => {
            tracing::error!("Failed to fetch item by id: {err}");
            match err {
                crate::error::DbError::NotFound => HttpResponse::NotFound()
                    .json(format!("Could not find item with id {}", item_id)),
                _ => HttpResponse::InternalServerError().json(err.to_string()),
            }
        }
    }
}

#[derive(serde::Deserialize, Debug)]
struct ItemUpdateBody {
    new_status: String,
}

#[tracing::instrument(skip(pool, auth_guard), fields(user_id = %auth_guard.user_id))]
#[post("/{id}")]
async fn update_item_status_handler(
    auth_guard: AuthenticationGuard,
    path: web::Path<i32>,
    data: web::Json<ItemUpdateBody>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    tracing::info!("update_item_status_handler called");
    let item_id = path.into_inner();
    let user_id = auth_guard.user_id;

    let item = item_repository::fetch_item_by_id(item_id, pool.as_ref()).await;

    match item {
        Ok(item) => {
            if item.user_id != user_id {
                tracing::warn!("unauthorized");
                return HttpResponse::Unauthorized()
                    .json("You are not authorized to update this item");
            }
        }
        Err(err) => {
            tracing::error!("Failed to fetch item by id when checking if user is authorized to update the item: {err}");
            match err {
                crate::error::DbError::NotFound => {
                    return HttpResponse::NotFound().json("Item not found")
                }
                _ => return HttpResponse::InternalServerError().json("Something went wrong"),
            };
        }
    };

    let new_status = match ItemStatus::from_str(&data.new_status) {
        Ok(status) => status,
        Err(_) => {
            tracing::error!("Failed to parse status");
            return HttpResponse::BadRequest().json("Invalid status");
        }
    };

    let response = item_repository::update_item_status(item_id, new_status, pool.as_ref()).await;

    match response {
        Ok(_) => HttpResponse::Ok().json("Item status updated"),
        Err(err) => {
            tracing::error!("Failed to update item status: {err}");
            match err {
                crate::error::DbError::NotFound => HttpResponse::NotFound().json("Item not found"),
                _ => HttpResponse::InternalServerError().json("Something went wrong"),
            }
        }
    }
}

#[derive(serde::Deserialize, Debug)]
struct ItemCreateBody {
    name: String,
    price: f64,
    category: String,
    description: Option<String>,
    images: Vec<String>,
}

#[tracing::instrument(skip(pool, auth_guar))]
#[post("/")]
async fn post_item_handler(
    auth_guar: AuthenticationGuard,
    data: web::Json<ItemCreateBody>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guar.user_id;

    let item = data.into_inner();

    if item.name.is_empty() {
        return HttpResponse::BadRequest().json("Missing item name field");
    }

    let category = match Category::from_str(&item.category) {
        Ok(category) => category,
        Err(_) => {
            tracing::error!("Failed to parse category");
            return HttpResponse::BadRequest().json("Invalid category");
        }
    };

    if item.price < 0.0 {
        tracing::error!("Invalid price");
        return HttpResponse::BadRequest().json("Invalid price");
    }

    if item.images.is_empty() {
        tracing::error!("Missing images");
        return HttpResponse::BadRequest().json("Missing images");
    }

    let item_price = (item.price * 100.0).round() / 100.0;

    let response = item_repository::insert_item(
        user_id,
        item.name,
        item_price,
        category,
        item.description,
        item.images,
        pool.as_ref(),
    )
    .await;

    match response {
        Ok(item_id) => {
            tracing::info!("Created item");
            return HttpResponse::Ok().json(item_id);
        }
        Err(err) => {
            tracing::error!("Failed to create item: {err}");
            HttpResponse::InternalServerError().json("Something went wrong")
        }
    }
}
