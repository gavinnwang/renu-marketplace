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

    conf.service(
        web::scope("/users")
            .service(super::user_handler::get_me_handler)
            .service(super::user_handler::get_user_by_id_handler)
            .service(super::user_handler::get_items_by_me_by_status_handler)
            .service(super::user_handler::get_items_by_user_id_and_status_handler),
    );
    conf.service(
        web::scope("/items")
            .service(super::item_handler::get_items_handler)
            .service(super::item_handler::get_item_by_id_handler)
            .service(super::item_handler::get_items_by_category_handler)
            .service(super::item_handler::update_item_status_handler),
    );

    conf.service(
        web::scope("/saved").service(super::saved_item_handler::get_saved_items_by_user_id),
    );

    conf.service(
        web::scope("/chats")
            .service(super::chat_handler::get_chat_groups_by_seller_id)
            .service(super::chat_handler::get_chat_groups_by_buyer_id)
            .service(super::chat_handler::get_chat_messages_by_chat_id),
    );
}
