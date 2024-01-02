pub mod authentication;
pub mod config;
pub mod error;
pub mod model;
pub mod notification;
pub mod openai;
pub mod repository;
pub mod routes;
pub mod uploads;
pub mod websocket;

use actix::Actor;
use actix_cors::Cors;
use actix_web::{http::header, web::Data, App, HttpServer};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use tracing_actix_web::TracingLogger;

use tonic::{transport::Server, Request, Response, Status};

pub mod hello {
    tonic::include_proto!("hello");
}
pub mod item {
    tonic::include_proto!("item");
}
use item::item_service_server::{ItemServiceServer, ItemService};
use item::{GetItemsByCategoryRequest, GetItemsByCategoryResponse};

#[tonic::async_trait]
impl ItemService for HelloService {
    async fn get_items_by_category(
        &self,
        request: Request<GetItemsByCategoryRequest>,
    ) -> Result<Response<GetItemsByCategoryResponse>, Status> {
        
        let items =repository::item_repository::fetch_items_by_status(model::item_model::ItemStatus::Active, 10, 0, pool.as_ref())
            .await
            .map_err(|e| Status::new(tonic::Code::Internal, e.to_string()))?;
    }
}

use hello::hello_server::{Hello, HelloServer};
use hello::{HelloRequest, HelloResponse};

#[derive(Debug, Default)]
pub struct HelloService {}

#[tonic::async_trait]
impl Hello for HelloService {
    async fn call(
        &self,
        request: Request<HelloRequest>,
    ) -> Result<Response<HelloResponse>, Status> {
        // println!("Got a request: {:?}", request);

        // let reply = HelloResponse {
        //     msg: "Ok".to_string(),
        // };

        // let mut err_details = ErrorDetails::new();

        // Ok(Response::new(reply))
        // let status = Status::with_error_details(
        //     Code::InvalidArgument,
        //     "request contains invalid arguments",
        //     err_details,
        // );

        Err(Status::new(
            tonic::Code::InvalidArgument,
            "request contains invalid arguments",
        ))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    // Load the configuration struct with all the environment variables
    let config = config::Config::init();

    tracing_subscriber::fmt()
        .event_format(
            tracing_subscriber::fmt::format()
                .with_file(true)
                .with_line_number(true),
        )
        .init();

    tracing::debug!("Debugging enabled");

    tracing::info!("Connecting to database");
    let pool = match PgPoolOptions::new()
        .max_connections(30)
        .connect(&config.database_url)
        .await
    {
        Ok(pool) => {
            tracing::info!("Connected to database");
            pool
        }
        Err(e) => {
            tracing::error!("Failed to connect to database: {}", e);
            std::process::exit(1);
        }
    };

    tracing::info!("Running migrations");
    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => {
            tracing::info!("Migrations run successfully!");
        }
        Err(err) => {
            tracing::info!("Failed to run migrations: {:?}", err);
            std::process::exit(1);
        }
    };

    match sqlx::query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        .fetch_all(&pool)
        .await
    {
        Ok(rows) => {
            for row in rows {
                match sqlx::Row::try_get::<String, _>(&row, 0) {
                    Ok(table_name) => tracing::info!("Table: {}", table_name),
                    Err(e) => tracing::error!("Error getting table name: {}", e),
                }
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
    )
    .await;

    let s3_client = Data::new(s3_client);

    tracing::info!("Starting gRPC server");
    let gaddr: std::net::SocketAddr = "0.0.0.0:50051".parse().unwrap();
    let hello_service = HelloService::default();
    let grpc = async move {
        tokio::task::spawn(
            Server::builder()
                .add_service(HelloServer::new(hello_service))
                .serve(gaddr),
        )
    };

    tracing::info!("Starting Actix web server");

    let http = HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "DELETE"])
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
    .workers(10)
    .run();

    let _ret = futures_util::future::join(grpc, http).await;
    Ok(())
}
