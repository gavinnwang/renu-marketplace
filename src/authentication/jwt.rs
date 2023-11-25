use std::{future::Future, pin::Pin};

use actix_web::{
    dev::Payload,
    error::{Error as ActixWebError, ErrorUnauthorized},
    http, web, FromRequest, HttpRequest,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::config::Config;

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: i32,
    pub iat: usize,
    pub exp: usize,
}

pub struct AuthenticationGuard {
    pub user_id: i32,
}

impl FromRequest for AuthenticationGuard {
    type Error = ActixWebError;
    // type Future = dyn Future<Output = Result<Self, Self::Error>>;

    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let token = req
            .cookie("token")
            .map(|c| c.value().to_string())
            .or_else(|| {
                req.headers()
                    .get(http::header::AUTHORIZATION)
                    .map(|h| h.to_str().unwrap_or("").to_string())
                    .or_else(|| {
                        req.query_string()
                            .split("&")
                            .find(|s| s.starts_with("authorization="))
                            .map(|s| s.split_at(("authorization=").len()).1.to_string())
                    })
            });

        let token = match token {
            Some(token) if token.len() < 7 => {
                tracing::error!("Auth guar error: token too short");
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!("Invalid token: token too short"),
                    ))
                });
            }
            Some(token) => token.split_at(7).1.to_string(),
            None => {
                tracing::warn!("Auth guard error: User token not found.");
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!("You are not logged in. Please provide a token"),
                    ))
                });
            }
        };

        let jwt_secret = match req.app_data::<web::Data<Config>>() {
            Some(config) => config.jwt_secret.clone(),
            None => {
                tracing::error!("Internal Server error: JWT secret not found");
                return Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!("Internal Server error: JWT secret not found"),
                    ))
                });
            }
        };

        let decode = decode::<TokenClaims>(
            token.as_str(),
            &DecodingKey::from_secret(jwt_secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        );
        
        match decode {
            Ok(decoded_token) => {
                Box::pin(async move {

                    let user_id = decoded_token.claims.sub;
                    Ok(AuthenticationGuard { user_id })
                })
            }
            Err(err) => {
                tracing::error!("token decoding error: {:?}", err);
                Box::pin(async {
                    Err(ErrorUnauthorized(
                        json!("Invalid token or user doesn't exist"),
                    ))
                })
            }
        }
    }
}
