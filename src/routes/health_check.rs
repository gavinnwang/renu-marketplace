use actix_web::{get, HttpResponse, Responder};

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "success", "message": "Hello World!"}))
}