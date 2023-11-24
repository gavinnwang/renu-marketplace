use actix_web::{get, post, web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{authentication::jwt::AuthenticationGuard, repository::chat_repository};

#[get("/seller")]
async fn get_chat_groups_by_seller_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let groups = chat_repository::fetch_chat_groups_by_seller_id(user_id, pool.as_ref()).await;

    match groups {
        Ok(groups) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": groups}))
        }
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch chat groups for user with id {user_id} as seller")
            );
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

#[get("/buyer")]
async fn get_chat_groups_by_buyer_id(
    auth_guard: AuthenticationGuard,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;

    let groups = chat_repository::fetch_chat_groups_by_buyer_id(user_id, pool.as_ref()).await;

    match groups {
        Ok(groups) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": groups}))
        }
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!("API: Failed to fetch chat groups for user with id {user_id} as buyer")
            );
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

#[get("/id/{item_id}")]
async fn get_chat_id_by_item_id(
    auth_guard: AuthenticationGuard,
    path: web::Path<i32>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let item_id = path.into_inner();

    let chat_id = chat_repository::fetch_chat_id_by_item_id(user_id, item_id, pool.as_ref()).await;

    match chat_id {
        Ok(chat_id) => HttpResponse::Ok()
            .json(serde_json::json!({"status": "success", "data": {"chat_id": chat_id}})),
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!(
                    "API: Failed to fetch chat id for user with id {user_id} and item id {item_id}"
                )
            );
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

// #[get("/window/{chat_id}")]
// async fn get_chat_window_by_chat_id(
//     auth_guard: AuthenticationGuard,
//     path: web::Path<i32>,
//     pool: web::Data<DbPool>,
// ) -> impl Responder {
//     let user_id = auth_guard.user_id;
//     let chat_id = path.into_inner();

//     let window =
//         chat_repository::fetch_chat_window_by_chat_id(user_id, chat_id, pool.as_ref()).await;

//     match window {
//         Ok(window) => {
//             HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": window}))
//         }
//         Err(err) => {
//             tracing::error!("{}\n", format!("API: Failed to fetch chat window for user with id {user_id} and chat id {chat_id}"));
//             tracing::error!("Error message: {}\n", err);

//             HttpResponse::InternalServerError()
//                 .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
//         }
//     }
// }

#[derive(Deserialize)]
pub struct GetChatMessageQuery {
    pub offset: Option<i32>,
    pub limit: Option<i32>,
}

#[get("/messages/{chat_id}")]
async fn get_chat_messages_by_chat_id(
    auth_guard: AuthenticationGuard,
    path: web::Path<i32>,
    pool: web::Data<PgPool>,
    query: web::Query<GetChatMessageQuery>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let chat_id = path.into_inner();

    let is_part_of_chat_group =
        chat_repository::check_if_user_id_is_part_of_chat_group(user_id, chat_id, pool.as_ref())
            .await;

    match is_part_of_chat_group {
        Ok(is_part_of_chat_group) => match is_part_of_chat_group {
            Some(_) => {}
            None => {
                return HttpResponse::Unauthorized().json(serde_json::json!({"status": "fail", "data": "API: You are not part of this chat group"}));
            }
        },
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to check if user with id {user_id} is part of chat group with id {chat_id}"));
            tracing::error!("Error message: {}\n", err);

            return HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}));
        }
    }

    let offset = query.offset.unwrap_or(0);
    let limit = query.limit.unwrap_or(25);

    let messages = chat_repository::fetch_chat_messages_by_chat_id(
        user_id,
        chat_id,
        offset,
        limit,
        pool.as_ref(),
    )
    .await;

    match messages {
        Ok(messages) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": messages}))
        }
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to fetch chat messages for user with id {user_id} and chat id {chat_id}"));
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

#[derive(Deserialize)]
pub struct ChatMessageRequest {
    pub content: String,
}

#[post("/message/{chat_id}")]
async fn post_chat_message(
    auth_guard: AuthenticationGuard,
    path: web::Path<i32>,
    message: web::Json<ChatMessageRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let chat_id = path.into_inner();

    if message.content.len() < 1 {
        return HttpResponse::BadRequest().json(
            serde_json::json!({"status": "fail", "data": "API: Message content cannot be empty"}),
        );
    }

    let is_part_of_chat_group =
        chat_repository::check_if_user_id_is_part_of_chat_group(user_id, chat_id, pool.as_ref())
            .await;

    match is_part_of_chat_group {
        Ok(is_part_of_chat_group) => match is_part_of_chat_group {
            Some(_) => {}
            None => {
                return HttpResponse::Unauthorized().json(serde_json::json!({"status": "fail", "data": "API: You are not part of this chat group"}));
            }
        },
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to check if user with id {user_id} is part of chat group with id {chat_id}"));
            tracing::error!("Error message: {}\n", err);

            return HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}));
        }
    }

    let message =
        chat_repository::insert_chat_message(user_id, chat_id, &message.content, pool.as_ref())
            .await;

    match message {
        Ok(message) => {
            HttpResponse::Ok().json(serde_json::json!({"status": "success", "data": message}))
        }
        Err(err) => {
            tracing::error!("{}\n", format!("API: Failed to insert chat message for user with id {user_id} and chat id {chat_id}"));
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}

#[derive(Deserialize)]
pub struct ChatRoomRequest {
    pub first_message_content: String,
}

#[post("/{item_id}")]
async fn post_chat_room_and_send_first_message(
    auth_guard: AuthenticationGuard,
    path: web::Path<i32>,
    pool: web::Data<PgPool>,
    message: web::Json<ChatRoomRequest>,
) -> impl Responder {
    let user_id = auth_guard.user_id;
    let item_id = path.into_inner();

    let chat_id = chat_repository::insert_chat_room(user_id, item_id, pool.as_ref()).await;

    match chat_id {
        Ok(chat_id) => {
            let send_message_result = chat_repository::insert_chat_message(
                user_id,
                chat_id,
                &message.first_message_content,
                pool.as_ref(),
            )
            .await;

            match send_message_result {
                Ok(_) => HttpResponse::Ok()
                    .json(serde_json::json!({"status": "success", "data": {"chat_id": chat_id}})),
                Err(err) => {
                    tracing::error!("{}\n", format!("API: Failed to send first message for user with id {user_id} and chat id {chat_id}"));
                    tracing::error!("Error message: {}\n", err);

                    HttpResponse::InternalServerError().json(
                        serde_json::json!({"status": "fail", "data": "API: Something went wrong"}),
                    )
                }
            }
        }
        Err(err) => {
            tracing::error!(
                "{}\n",
                format!(
                    "API: Failed to insert chat for user with id {user_id} and item id {item_id}"
                )
            );
            tracing::error!("Error message: {}\n", err);

            HttpResponse::InternalServerError()
                .json(serde_json::json!({"status": "fail", "data": "API: Something went wrong"}))
        }
    }
}
