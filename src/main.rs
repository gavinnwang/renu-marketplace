pub mod authentication;
pub mod config;
pub mod error;
pub mod model;
pub mod repository;
pub mod routes;
pub mod websocket;

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

    // tracing::debug!("Debugging enabled");

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
    let server = websocket::server::ChatServer::new().start();

    tracing::info!("Starting Actix web server");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ])
            .supports_credentials();
        App::new()
            .app_data(Data::new(config.clone()))
            .app_data(Data::new(pool.clone()))
            .app_data(Data::new(server.clone()))
            .wrap(cors)
            .configure(routes::handler_register::handlers)
            .service(websocket::ws_handler::ws_route)
            .wrap(TracingLogger::default())
    })
    .bind((server_host, server_port))?
    .workers(20)
    .run()
    .await
}
