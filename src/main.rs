pub mod routes;

use actix_cors::Cors;
use actix_web::{http::header, App, HttpServer};
use dotenv::dotenv;
use routes::health_check::health_check;
use sqlx::{mysql::MySqlPoolOptions, query, Row};
use std::env;
use tracing_actix_web::TracingLogger;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    // Read the database URL from the environment variable
    let database_url = env::var("DATABASE_URL_RUST").expect("DATABASE_URL not set");

    tracing::info!("Connecting to database");
    let pool = match MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
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
            .service(health_check)
            // .app_data(app_data.clone())
            // .service(actix_files::Files::new("/api/images", &public_dir))
            // .configure(handler::config)
            .wrap(cors)
            .wrap(TracingLogger::default())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
