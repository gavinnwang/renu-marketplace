use actix_web::web;

use super::auth_handler::google_oauth_handler;
use super::auth_handler::logout_handler;
use super::health_handler::health_check_handler;

pub fn handlers(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(health_check_handler)
        .service(
            web::scope("/auth") 
                .service(google_oauth_handler)
                .service(logout_handler),
        )
        .service(web::scope("/users").service(super::user_handler::get_user_handler));

    conf.service(scope);
}
