use core::panic;

#[derive(Debug, Clone)]
pub struct Config {
    pub jwt_secret: String,
    pub jwt_max_age: i64,
    pub google_oauth_client_id: String,
    pub google_oauth_client_secret: String,
    pub google_oauth_redirect_url: String,

    pub database_url: String,
    pub server_port: u16,
    pub server_host: String,

    pub s3_bucket_name: String,
    pub s3_region: String,
    pub s3_key: String,
    pub s3_key_secret: String,

    pub openai_api_key: String,
}

impl Config {
    pub fn init() -> Config {
        let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let jwt_max_age = std::env::var("TOKEN_MAXAGE").expect("TOKEN_MAXAGE must be set");
        let google_oauth_client_id =
            std::env::var("GOOGLE_OAUTH_CLIENT_ID").expect("GOOGLE_OAUTH_CLIENT_ID must be set");
        let google_oauth_client_secret = std::env::var("GOOGLE_OAUTH_CLIENT_SECRET")
            .expect("GOOGLE_OAUTH_CLIENT_SECRET must be set");

        let env = std::env::var("ENV").unwrap_or("production".to_string());
        let google_oauth_redirect_url = match env.as_str() {
            "production" => std::env::var("GOOGLE_OAUTH_REDIRECT_URL")
                .expect("GOOGLE_OAUTH_REDIRECT_URL must be set"),
            "development" => std::env::var("GOOGLE_OAUTH_REDIRECT_URL_DEV")
                .expect("GOOGLE_OAUTH_REDIRECT_URL_DEV must be set"),
            _ => {
                panic!("Invalid ENV variable");
            }
        };
        let database_name = std::env::var("DATABASE_NAME").expect("DATABASE_NAME must be set");
        let database_user = std::env::var("DATABASE_USER").expect("DATABASE_USER must be set");
        let database_password =
            std::env::var("DATABASE_PASSWORD").expect("DATABASE_PASSWORD must be set");
        let database_host = std::env::var("DATABASE_HOST").expect("DATABASE_HOST must be set");
        let database_port = std::env::var("DATABASE_PORT").expect("DATABASE_PORT must be set");
        let database_url = format!(
            "postgresql://{}:{}@{}:{}/{}",
            database_user, database_password, database_host, database_port, database_name
        );
        let database_url_from_env =
            std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"); // we need database url for sqlx to work
        if database_url_from_env != database_url {
            panic!("Databse url from env is not equal to the one generated from env variables, {} != {}", database_url_from_env, database_url);
        }
        let server_port = std::env::var("SERVER_PORT").expect("SERVER_PORT must be set");
        let server_host = std::env::var("SERVER_HOST").expect("SERVER_HOST must be set");

        let s3_bucket_name = std::env::var("S3_BUCKET_NAME").expect("S3_BUCKET_NAME must be set");
        let s3_region = std::env::var("S3_REGION").expect("S3_REGION must be set");
        let s3_key = std::env::var("S3_KEY").expect("S3_KEY must be set");
        let s3_key_secret = std::env::var("S3_KEY_SECRET").expect("S3_KEY_SECRET must be set");

        let openai_api_key = std::env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY must be set");

        Config {
            jwt_secret,
            jwt_max_age: jwt_max_age
                .parse::<i64>()
                .expect("TOKEN_MAXAGE must be an integer"),
            google_oauth_client_id,
            google_oauth_client_secret,
            google_oauth_redirect_url,
            database_url,
            server_port: server_port
                .parse::<u16>()
                .expect("SERVER_PORT must be an integer"),
            server_host,
            s3_bucket_name,
            s3_region,
            s3_key,
            s3_key_secret,
            openai_api_key,
        }
    }
}
