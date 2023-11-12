pub mod authentication;
pub mod config;
pub mod error;
pub mod model;
pub mod repository;
pub mod routes;
pub mod websocket;
pub mod uploads;

use actix::Actor;
use actix_cors::Cors;
use actix_web::{http::header, web::Data, App, HttpServer};
use dotenv::dotenv;
use sqlx::{mysql::MySqlPoolOptions, query, Row};
use tracing_actix_web::TracingLogger;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    // Load the configuration struct with all the environment variables
    let config = config::Config::init();

    tracing_subscriber::fmt::init();

    tracing::debug!("Debugging enabled");

    tracing::info!("Connecting to database");
    let pool = match MySqlPoolOptions::new()
        .max_connections(30)
        .connect(&config.database_url)
        .await
    {
        Ok(pool) => {
            tracing::info!("Connection to the database is successful!");
            pool
        }
        Err(err) => {
            tracing::info!("Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    // Test the connection to the database by running a show tables query
    match query("SHOW TABLES").fetch_all(&pool).await {
        Ok(rows) => {
            for row in &rows {
                let table_name: String = row.get(0);
                tracing::info!("Table: {}", table_name);
            }
        }
        Err(e) => {
            tracing::error!("Failed to execute query: {}", e);
        }
    }

    let server_host = config.server_host.clone();
    let server_port = config.server_port;

    tracing::info!("Server listening on {}:{}", server_host, server_port);

    tracing::info!("Starting websocket chat server");
    let server = websocket::server::ChatServer::new(Data::new(pool.clone())).start();

    tracing::info!("Configuring S3 client");
    let s3_client = uploads::startup::configure_and_return_s3_client(
        config.s3_key.clone(),
        config.s3_key_secret.clone(),
        config.s3_region.clone(),
        config.s3_bucket_name.clone(),
    ).await;

    let s3_client = Data::new(s3_client);

    tracing::info!("Starting Actix web server");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
                header::UPGRADE,
                header::CONNECTION,
            ])
            .supports_credentials();
        App::new()
            .app_data(Data::new(config.clone()))
            .app_data(Data::new(pool.clone()))
            .app_data(Data::new(server.clone()))
            .app_data(s3_client.clone())
            .wrap(cors)
            .configure(routes::handler_register::handlers)
            .service(websocket::ws_handler::ws_route)
            .wrap(TracingLogger::default())
    })
    .bind((server_host, server_port))?
    .workers(5)
    .run()
    .await
}
