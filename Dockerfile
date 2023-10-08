# FROM --platform=linux/amd64 rust:latest

# WORKDIR /src
# COPY . .
# CMD ["./target/release/marketplace"]


FROM clux/muslrust:stable AS chef
USER root
RUN cargo install cargo-chef

WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ARG DATABASE_URL
# ENV DATABASE_URL=$DATABASE_URL
# RUN cargo install sqlx-cli --no-default-features --features rustls,mysql
# RUN cargo sqlx prepare --database-url $DATABASE_URL
# RUN cargo build --release   

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
ENV SQLX_OFFLINE true
# Build application
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .

RUN cargo build --release --target x86_64-unknown-linux-musl --bin app

# We do not need the Rust toolchain to run the binary!
FROM alpine AS runtime
RUN addgroup -S myuser && adduser -S myuser -G myuser
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/marketplace /usr/local/bin/
# RUN apt-get update && apt install -y openssl
# RUN apt-get install -y libssl-dev
ENV sqlx=off
ENTRYPOINT ["/usr/local/bin/marketplace"]