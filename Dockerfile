# FROM --platform=linux/amd64 rust:latest

# WORKDIR /src
# COPY . .
# CMD ["./target/release/marketplace"]


FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN cargo install sqlx-cli --no-default-features --features rustls,mysql
RUN cargo sqlx prepare --database-url $DATABASE_URL
# RUN cargo build --release   

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
RUN cargo build --release 

# We do not need the Rust toolchain to run the binary!
FROM debian:bookworm-slim AS runtime
WORKDIR /app
COPY --from=builder /app/target/release/marketplace /usr/local/bin
ENTRYPOINT ["/usr/local/bin/app"]