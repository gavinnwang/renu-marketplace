
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
}

impl Config {
    pub fn init() -> Config {
        let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let jwt_max_age = std::env::var("TOKEN_MAXAGE").expect("TOKEN_MAXAGE must be set");
        let google_oauth_client_id =
            std::env::var("GOOGLE_OAUTH_CLIENT_ID").expect("GOOGLE_OAUTH_CLIENT_ID must be set");
        let google_oauth_client_secret = std::env::var("GOOGLE_OAUTH_CLIENT_SECRET")
            .expect("GOOGLE_OAUTH_CLIENT_SECRET must be set");
        let google_oauth_redirect_url = std::env::var("GOOGLE_OAUTH_REDIRECT_URL")
            .expect("GOOGLE_OAUTH_REDIRECT_URL must be set");
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let server_port = std::env::var("SERVER_PORT").expect("SERVER_PORT must be set");
        let server_host = std::env::var("SERVER_HOST").expect("SERVER_HOST must be set");

        Config {
            jwt_secret,
            jwt_max_age: jwt_max_age.parse::<i64>().unwrap(),
            google_oauth_client_id,
            google_oauth_client_secret,
            google_oauth_redirect_url,
            database_url,
            server_port: server_port.parse::<u16>().unwrap(),
            server_host,
        }
    }
}