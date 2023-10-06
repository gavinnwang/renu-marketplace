use actix_web::ResponseError;
use reqwest::StatusCode;
use sqlx::mysql::MySqlDatabaseError;
use thiserror::Error;

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
    #[error("mysql error: {0}")]
    MySqlDatabaseError(Box<MySqlDatabaseError>),
    /// Other error.
    #[error("{0}")]
    Other(sqlx::Error),
}

impl ResponseError for DbError {
    fn status_code(&self) -> actix_http::StatusCode {
        match self {
            DbError::NotFound => StatusCode::NOT_FOUND,
            DbError::Conflict => StatusCode::CONFLICT,
            DbError::ConnectionError => StatusCode::INTERNAL_SERVER_ERROR,
            DbError::MySqlDatabaseError(e) => match e.code() {
                Some("1062") => StatusCode::BAD_REQUEST,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
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
                let mysql_error = e.try_downcast::<MySqlDatabaseError>();
                match mysql_error {
                    Ok(mysql_error) => DbError::MySqlDatabaseError(mysql_error),
                    Err(e) => DbError::Other(sqlx::Error::Database(e)),
                }
            }
            e => DbError::Other(e),
        }
    }
}
