use actix_web::web;

use super::auth_handler::google_oauth_handler;
use super::auth_handler::logout_handler;
use super::health_handler::health_check_handler;

pub fn handlers(conf: &mut web::ServiceConfig) {
    conf.service(health_check_handler);
    conf.service(super::health_handler::index_handler);
    
    conf.service(
        web::scope("/auth")
            .service(google_oauth_handler)
            .service(logout_handler),
    );

    conf.service(web::scope("/users").service(super::user_handler::get_user_handler));

    conf.service(
        web::scope("/items")
            .service(super::item_handler::get_items_handler)
            .service(super::item_handler::get_item_by_id_handler),
    );
}
