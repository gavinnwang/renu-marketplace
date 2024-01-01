use actix_web::web;

use super::auth_handler::google_oauth_handler;
use super::auth_handler::logout_handler;

pub fn handlers(conf: &mut web::ServiceConfig) {
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
            .service(super::user_handler::get_active_items_by_user_id)
            .service(super::user_handler::post_push_token_handler)
            .service(super::user_handler::delete_push_token_handler),
    );
    conf.service(
        web::scope("/items")
            .service(super::item_handler::get_items_handler)
            .service(super::item_handler::get_item_by_id_handler)
            .service(super::item_handler::update_item_status_handler)
            .service(super::item_handler::post_item_handler),
    );

    conf.service(
        web::scope("/saved")
            .service(super::saved_item_handler::get_saved_items_handler)
            .service(super::saved_item_handler::get_saved_item_status_handler)
            .service(super::saved_item_handler::post_saved_item_handler),
    );

    conf.service(
        web::scope("/chats")
            .service(super::chat_handler::get_chat_groups_by_seller_id)
            .service(super::chat_handler::get_chat_groups_by_buyer_id)
            .service(super::chat_handler::get_chat_messages_by_chat_id)
            .service(super::chat_handler::get_chat_id_by_item_id)
            .service(super::chat_handler::post_chat_room_and_send_first_message)
            .service(super::chat_handler::get_unread_chat_group_count_by_user_id),
    );

    conf.service(web::scope("/search").service(super::item_search_handler::search_items_handler));

    conf.service(web::scope("/images").service(super::image_upload_handler::post_images));

    conf.service(web::scope("/openai").service(super::openai_handler::chat_complete_handler));
}
