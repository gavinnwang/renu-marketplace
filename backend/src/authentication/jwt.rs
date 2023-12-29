use std::{future::Future, pin::Pin};

use actix_web::{dev::Payload, http, web, FromRequest, HttpRequest};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::{config::Config, error::UserError};

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
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        // get token from cookie or header or query string
        // if get token from header or query string, remove "Bearer " from token
        let token = req
            .cookie("token")
            .map(|c| c.value().to_string())
            .or_else(|| {
                let token = req
                    .headers()
                    .get(http::header::AUTHORIZATION)
                    .map(|h| h.to_str().unwrap_or("").to_string())
                    .or_else(|| {
                        req.query_string()
                            .split("&")
                            .find(|s| s.starts_with("authorization="))
                            .map(|s| s.split_at(("authorization=").len()).1.to_string())
                    });

                match token {
                    Some(token) if token.len() < 7 => None,
                    Some(token) => Some(token.split_at(7).1.to_string()),
                    None => None,
                }
            });

        let token = match token {
            Some(token) => token,
            None => {
                tracing::warn!("User token not found.");
                return Box::pin(async { Err(UserError::AuthError.into()) });
            }
        };
        tracing::info!("token: {}", token);

        let jwt_secret = match req.app_data::<web::Data<Config>>() {
            Some(config) => &config.jwt_secret,
            None => {
                tracing::error!("JWT secret not found");
                return Box::pin(async { Err(UserError::AuthError.into()) });
            }
        };

        let decode = decode::<TokenClaims>(
            token.as_str(),
            &DecodingKey::from_secret(jwt_secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        );

        match decode {
            Ok(decoded_token) => Box::pin(async move {
                let user_id = decoded_token.claims.sub;
                Ok(AuthenticationGuard { user_id })
            }),
            Err(err) => {
                tracing::error!("token decoding error: {:#?}", err);
                Box::pin(async { Err(UserError::AuthError.into()) })
            }
        }
    }
}
