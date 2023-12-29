use actix_web::error;
use reqwest::StatusCode;
use sqlx::postgres::PgDatabaseError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("An internal error occurred. Please try again later.")]
    InternalError,
    #[error("Invalid credentials. Please log in again.")]
    AuthError,
    #[error("An error occurred while creating account.")]
    CreateUserError,
}



impl error::ResponseError for UserError {
    fn error_response(&self) -> actix_web::HttpResponse {
        actix_web::HttpResponse::build(self.status_code())
            .insert_header(actix_web::http::header::ContentType::json())
            .json(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            UserError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            UserError::AuthError => StatusCode::UNAUTHORIZED,
            UserError::CreateUserError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

/// Error representing a failure at the database layer.
#[derive(Debug, Error)]
pub enum DbError {
    /// Not found.
    #[error("entity not found")]
    NotFound,
    /// Conflict.
    #[error("entity already exists")]
    Conflict,
    /// Connection error.
    #[error("could not connect to database")]
    ConnectionError,
    /// Connection error.
    #[error("postgres error: {0}")]
    PgDatabaseError(Box<PgDatabaseError>),
    /// Other error.
    #[error("{0}")]
    Other(sqlx::Error),
}

impl error::ResponseError for DbError {
    // fn error_response(&self) -> actix_web::HttpResponse {
    //     actix_web::HttpResponse::build(self.status_code())
    //         .insert_header(actix_web::http::header::ContentType::plaintext())
    //         .body(self.to_string())
    // }

    fn status_code(&self) -> actix_http::StatusCode {
        match self {
            DbError::NotFound => StatusCode::NOT_FOUND,
            DbError::Conflict => StatusCode::CONFLICT,
            DbError::ConnectionError => StatusCode::INTERNAL_SERVER_ERROR,
            DbError::PgDatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            DbError::Other(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl From<sqlx::Error> for DbError {
    fn from(error: sqlx::Error) -> Self {
        match error {
            sqlx::Error::RowNotFound => DbError::NotFound,
            sqlx::Error::Io(_) => DbError::ConnectionError,
            sqlx::Error::Database(e) => {
                let postgres_error = e.try_downcast::<PgDatabaseError>();
                match postgres_error {
                    Ok(postgres_error) => DbError::PgDatabaseError(postgres_error),
                    Err(e) => DbError::Other(sqlx::Error::Database(e)),
                }
            }
            e => DbError::Other(e),
        }
    }
}
