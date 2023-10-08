use std::{future::Future, pin::Pin};

use actix_web::{
    dev::Payload,
    error::{Error as ActixWebError, ErrorUnauthorized},
    http, web, FromRequest, HttpRequest,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{config::Config, model::db_model::DbPool, repository::user_repository};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: i64,
    pub iat: usize,
    pub exp: usize,
}

pub struct AuthenticationGuard {
    pub user_id: i64,
}

impl FromRequest for AuthenticationGuard {
    type Error = ActixWebError;
    // type Future = Ready<Result<Self, Self::Error>>;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let token = req
            .cookie("token")
            .map(|c| c.value().to_string())
            .or_else(|| {
                req.headers()
                    .get(http::header::AUTHORIZATION)
                    .map(|h| h.to_str().unwrap().split_at(7).1.to_string())
            });

        let token = match token {
            Some(token) => token,
            None => {
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!({"status": "fail", "message": "You are not logged in. Please provide a token"}),
                    ))
                })
            }
        };

        let jwt_secret = match req.app_data::<web::Data<Config>>() {
            Some(config) => config.jwt_secret.clone(),
            None => {
                tracing::error!("Internal Server error: JWT secret not found");
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!({"status": "fail", "message": "Internal Server error: JWT secret not found"}),
                    ))
                });
            }
        };

        let decode = decode::<TokenClaims>(
            token.as_str(),
            &DecodingKey::from_secret(jwt_secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        );

        let pool = match req.app_data::<web::Data<DbPool>>() {
            Some(pool) => pool.clone(),
            None => {
                tracing::error!("Internal Server error: Database connection failed");
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!({"status": "fail", "message": "Internal Server error: Database connection failed"}),
                    ))
                });
            }
        };

        match decode {
            Ok(decoded_token) => {
                let user_id = decoded_token.claims.sub.clone();
                Box::pin(async move {
                    let user_result =
                        user_repository::fetch_user_by_id(pool.as_ref(), user_id).await;

                    if user_result.is_err() {
                        return Err(ErrorUnauthorized(
                            json!({"status": "fail", "message": "User belonging to this token no longer exists"}),
                        ));
                    };

                    let user_id = decoded_token.claims.sub;
                    Ok(AuthenticationGuard { user_id: user_id })
                })
            }
            Err(_) => Box::pin(async {
                Err(ErrorUnauthorized(
                    json!({"status": "fail", "message": "Invalid token or user doesn't exist"}),
                ))
            }),
        }
    }
}
