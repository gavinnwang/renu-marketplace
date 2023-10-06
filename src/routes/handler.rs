use actix_web::web;

use super::health_check::health_check_handler;
use super::authentication::google_oauth_handler;
use super::authentication::logout_handler;


pub fn handlers(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(health_check_handler)
        .service(google_oauth_handler)
        .service(logout_handler)
        .service(web::scope("/users").service(super::user_handler::get_user_handler));
    
    conf.service(scope);
}