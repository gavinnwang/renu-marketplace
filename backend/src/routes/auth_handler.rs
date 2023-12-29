use actix_http::header::LOCATION;
use actix_web::{
    cookie::{time::Duration as ActixWebDuration, Cookie},
    get, web, HttpResponse, Responder,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    authentication::{
        google_oauth::{get_google_user, request_token, QueryCode},
        jwt::{AuthenticationGuard, TokenClaims},
    },
    config::Config,
    error::DbError,
    repository::user_repository,
};

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum DeviceType {
    Mobile,
    Web,
}

#[derive(Deserialize)]
struct State {
    device_type: DeviceType,
    callback: String,
}

#[tracing::instrument(skip(config, pool))]
#[get("/callback")]
async fn google_oauth_handler(
    query: web::Query<QueryCode>,
    config: web::Data<Config>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let code = &query.code;
    let state = &query.state;

    if code.is_empty() {
        tracing::error!("Google OAuth: Authorization code not provided!");
        return HttpResponse::Unauthorized().json("Authorization code not provided!");
    }

    if state.is_empty() {
        tracing::error!("Google OAuth: State not provided!");
        return HttpResponse::Unauthorized().json("State not provided!");
    }

    let state: State = match serde_json::from_str(state) {
        Err(err) => {
            tracing::error!("Failed to parse state: {err}");
            return HttpResponse::Unauthorized().json("Failed to parse state");
        }
        Ok(state) => state,
    };

    let token_response = request_token(code.as_str(), &config).await;

    let token_response = match token_response {
        Err(message) => {
            tracing::error!("Failed to request token from Google OAuth {}", message);
            return HttpResponse::BadGateway()
                .json("Failed to request token from Google OAuth API");
        }
        Ok(token_response) => token_response,
    };

    let google_user =
        match get_google_user(&token_response.access_token, &token_response.id_token).await {
            Err(message) => {
                let message = message.to_string();
                return HttpResponse::BadGateway().json(message);
            }
            Ok(google_user) => google_user,
        };

    // if email doesn't end in northwestern.edu redirect to 404 page

    // if !google_user.email.ends_with("northwestern.edu") {
    //     tracing::warn!(
    //         "User email is not northwestern edu email: {}\n",
    //         google_user.email
    //     );

    //     return HttpResponse::InternalServerError().json("User email is not northwestern.edu email"}));
    // }

    let user_id = user_repository::fetch_user_id_by_email(pool.as_ref(), &google_user.email).await;

    let user_id = match user_id {
        Err(err) => match err {
            DbError::NotFound => {
                // if user doesn't exist, create new user
                tracing::info!(
                    "User with email {} not found, creating new user",
                    google_user.email
                );
                let user_id = user_repository::add_user(
                    pool.as_ref(),
                    &google_user.name,
                    &google_user.email,
                    &google_user.picture,
                )
                .await;
                match user_id {
                    Err(err) => {
                        tracing::error!("Failed to add user: {err}");
                        return HttpResponse::InternalServerError().json("Failed to add user");
                    }
                    Ok(user_id) => user_id,
                }
            }

            _ => {
                tracing::error!("Failed to fetch user id by email: {err}");
                return HttpResponse::InternalServerError()
                    .json("Failed to fetch user id by email");
            }
        },
        Ok(user_id) => user_id,
    };

    tracing::info!("Generating jwt token for user with id {user_id}");

    let jwt_secret = &config.jwt_secret;
    let now = Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::minutes(config.jwt_max_age)).timestamp() as usize;
    let claims = TokenClaims {
        sub: user_id,
        exp,
        iat,
    };

    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    ) {
        Err(err) => {
            tracing::error!("Failed to encode token: {err}");
            return HttpResponse::BadGateway()
                .json("Failed to encode token, please try again later");
        }
        Ok(token) => token,
    };

    match state.device_type {
        DeviceType::Mobile => {
            let redirect_url = format!(
                "{}?email={}&name={}&token={}&user_id={}",
                state.callback, google_user.email, google_user.name, token, user_id
            );
            tracing::info!("Mobile user logged in with redirect url: {}", redirect_url);
            HttpResponse::Found()
                .append_header((LOCATION, redirect_url))
                .finish()
        }
        DeviceType::Web => {
            let cookie = Cookie::build("token", &token)
                .path("/")
                .max_age(ActixWebDuration::new(60 * config.jwt_max_age, 0))
                .http_only(true)
                .finish();
            tracing::info!("Web user logged in");
            HttpResponse::Found()
                .append_header((LOCATION, state.callback))
                .cookie(cookie)
                .finish()
        }
    }

    // let cookie = Cookie::build("token", token.clone())
    //     .path("/")
    //     .max_age(ActixWebDuration::new(60 * config.jwt_max_age, 0))
    //     .http_only(true)
    //     .finish();

    // let mut response = HttpResponse::Found();
    // let redirect_url = format!(
    //     "{state}?email={}&name={}&token={}&user_id={}",
    //     google_user.email, google_user.name, token, user_id
    // );
    // tracing::info!("Redirecting to {}\n", redirect_url);
    // response.append_header((LOCATION, redirect_url));
    // response.finish()
}

#[tracing::instrument(skip_all, fields(user_id = %auth_guard.user_id))]
#[get("/logout")]
async fn logout_handler(auth_guard: AuthenticationGuard) -> impl Responder {
    tracing::info!("User logged out");
    let cookie = Cookie::build("token", "")
        .path("/")
        .max_age(ActixWebDuration::new(-1, 0))
        .http_only(true)
        .finish();

    HttpResponse::Ok()
        .cookie(cookie)
        .json("Successfully logged out")
}
