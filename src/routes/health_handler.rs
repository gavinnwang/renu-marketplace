use actix_web::{get, HttpResponse, Responder};

#[get("/")]
async fn index_handler() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "OK", "name": "api.gavinwang.dev", "version": "0.1.0"}))
}