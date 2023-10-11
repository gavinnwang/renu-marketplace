use actix_web::{get, HttpResponse, Responder};

#[get("/health")]
async fn health_check_handler() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "success", "message": "hello world"}))
}

#[get("/")]
async fn index_handler() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "success", "message": "api.gavinwang.dev"}))
}