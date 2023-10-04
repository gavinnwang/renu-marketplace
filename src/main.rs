extern crate dotenv;
extern crate mysql;

use dotenv::dotenv;
use mysql::prelude::*;
use std::env;

fn main() {
    println!("Hello, world!");
    // Load environment variables from .env file if present
    dotenv().ok();

    // Read the database URL from the environment variable
    let database_url = env::var("DATABASE_URL_RUST").expect("DATABASE_URL not set");

    let builder = mysql::OptsBuilder::from_opts(mysql::Opts::from_url(&database_url).unwrap());
    let pool = mysql::Pool::new(builder.ssl_opts(mysql::SslOpts::default())).unwrap();

    // Acquire a connection from the pool
    let mut conn = pool.get_conn().expect("Failed to get connection from pool");

    // Run the SHOW TABLES query
    let tables: Vec<String> = conn
        .query_map("SHOW TABLES", |row: mysql::Row| {
            let table_name: String = mysql::from_row(row);
            table_name
        })
        .expect("Failed to execute query");

    // Print out the table names
    for table in tables {
        println!("Table Name: {}", table);
    }
}
