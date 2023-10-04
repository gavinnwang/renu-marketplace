extern crate dotenv;
extern crate mysql;

use actix_cors::Cors;
use actix_web::{http::header, App, HttpServer};
use dotenv::dotenv;
use sqlx::{mysql::MySqlPoolOptions, query, Row};
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    // Read the database URL from the environment variable
    let database_url = env::var("DATABASE_URL_RUST").expect("DATABASE_URL not set");

    let pool = match MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
    {
        Ok(p) => p,
        Err(sqlx::Error::PoolTimedOut) => panic!("Database timed out"),
        Err(e) => panic!("Database connection error: {:?}", e),
    };

    match query("SHOW TABLES").fetch_all(&pool).await {
        Ok(rows) => {
            for row in &rows {
                let table_name: String = row.get(0);
                println!("Table: {}", table_name);
            }
        }
        Err(e) => {
            eprintln!("Failed to execute query: {}", e);
        }
    }

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
            // .app_data(app_data.clone())
            // .service(actix_files::Files::new("/api/images", &public_dir))
            // .configure(handler::config)
            .wrap(cors)
        // .wrap(Logger::default())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
