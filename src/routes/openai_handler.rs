use actix_web::{post, web, HttpResponse, Responder};

use crate::{
    authentication::jwt::AuthenticationGuard, config::Config, openai::request::request_openai_api,
};

#[derive(serde::Deserialize, Debug)]
struct ChatCompleteRequest {
    image: String,
}

#[tracing::instrument(skip(config, auth_guard), fields(user_id = %auth_guard.user_id))]
#[post("/complete")]
async fn chat_complete_handler(
    auth_guard: AuthenticationGuard,
    data: web::Json<ChatCompleteRequest>,
    config: web::Data<Config>,
) -> impl Responder {
    tracing::info!("chat_complete_handler called");
    let res = request_openai_api(&data.image, &config).await;

    match res {
        Ok(res) => {
            let res = match res.choices.get(0) {
                Some(res) => &res.message.content,
                None => {
                    return HttpResponse::InternalServerError().json("No response from OpenAI");
                }
            };
            let res = res
                .trim_start_matches("```json\n")
                .trim_end_matches("\n```");
            match serde_json::from_str::<Response>(res) {
                Ok(parsed_res) => HttpResponse::Ok().json(parsed_res),
                Err(err) => HttpResponse::InternalServerError().json(err.to_string()),
            }
        }
        Err(err) => HttpResponse::InternalServerError().json(err.to_string()),
    }
}

#[derive(serde::Deserialize, Debug, serde::Serialize)]
pub struct Response {
    pub price: i64,
    pub title: String,
    pub description: String,
}
