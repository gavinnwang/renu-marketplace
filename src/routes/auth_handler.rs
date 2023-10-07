use actix_http::header::LOCATION;
use actix_web::{
    cookie::{time::Duration as ActixWebDuration, Cookie},
    get, web, HttpResponse, Responder,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};

use crate::{
    authentication::{
        google_oauth::{get_google_user, request_token, QueryCode},
        jwt::{AuthenticationGuard, TokenClaims},
    },
    config::Config,
    model::{db_model::DbPool, user_model::NewUser},
    repository::user_repository,
};

#[get("/callback")]
async fn google_oauth_handler(
    query: web::Query<QueryCode>,
    config: web::Data<Config>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let code = &query.code;
    let state = &query.state;

    if code.is_empty() {
        return HttpResponse::Unauthorized().json(
            serde_json::json!({"status": "fail", "message": "Authorization code not provided!"}),
        );
    }

    let token_response = request_token(code.as_str(), &config).await;

    let token_response = match token_response {
        Err(message) => {
            let message = message.to_string();
            return HttpResponse::BadGateway()
                .json(serde_json::json!({"status": "fail", "message": message}));
        }
        Ok(token_response) => token_response,
    };

    let google_user =
        match get_google_user(&token_response.access_token, &token_response.id_token).await {
            Err(message) => {
                let message = message.to_string();
                return HttpResponse::BadGateway()
                    .json(serde_json::json!({"status": "fail", "message": message}));
            }
            Ok(google_user) => google_user,
        };

    // if email doesn't end in northwestern.edu redirect to 404 page

    if !google_user.email.ends_with("northwestern.edu") {
        tracing::warn!(
            "API: User email is not northwestern edu email: {}\n",
            google_user.email
        );
        let frontend_origin = config.client_origin.to_owned();
        let mut response = HttpResponse::Found();
        return response.append_header((LOCATION, format!("{}{}", frontend_origin, "/failed_sign_in"))).json(serde_json::json!({"status": "fail", "message": "User email is not northwestern.edu email"}));
    }

    let user = user_repository::fetch_user_by_email(pool.as_ref(), &google_user.email).await;

    let user_id = match user {
        Err(_) => {
            let user_id = user_repository::add_user(
                pool.as_ref(),
                &NewUser {
                    name: google_user.name,
                    email: google_user.email,
                },
            )
            .await;
            match user_id {
                Err(message) => {
                    let message = message.to_string();
                    tracing::error!("Failed to add user: {}", message);
                    return HttpResponse::BadGateway()
                        .json(serde_json::json!({"status": "fail", "message": message}));
                }
                Ok(user_id) => user_id,
            }
        }
        Ok(user) => user.id,
    };

    tracing::info!("API: User id authenticating: {}\n", user_id);

    let jwt_secret = config.jwt_secret.to_owned();
    let now = Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::minutes(config.jwt_max_age)).timestamp() as usize;
    let claims = TokenClaims {
        sub: user_id,
        exp,
        iat,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
    .unwrap();

    let cookie = Cookie::build("token", token.clone())
        .path("/")
        .max_age(ActixWebDuration::new(60 * config.jwt_max_age, 0))
        .http_only(true)
        .finish();

    let frontend_origin = config.client_origin.to_owned();
    let mut response = HttpResponse::Found();
    response.append_header((LOCATION, format!("{}{}", frontend_origin, state)));
    response.cookie(cookie);
    response.finish()
}

#[get("/logout")]
async fn logout_handler(auth_gaurd: AuthenticationGuard) -> impl Responder {
    tracing::info!("API: User with id {} logging out\n", auth_gaurd.user_id);
    let cookie = Cookie::build("token", "")
        .path("/")
        .max_age(ActixWebDuration::new(-1, 0))
        .http_only(true)
        .finish();

    HttpResponse::Ok()
        .cookie(cookie)
        .json(serde_json::json!({"status": "success"}))
}
