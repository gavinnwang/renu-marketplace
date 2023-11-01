use actix_web::{get, web, Responder, HttpResponse};

use crate::{authentication::jwt::AuthenticationGuard, model::db_model::DbPool};

#[get("/")]
async fn get_chat_groups_by_user_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    
    HttpResponse::Ok().json("hello world")
}
