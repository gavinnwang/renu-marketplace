FROM rust:latest

# Set the Rust toolchain to the stable version
RUN rustup default stable

RUN apt-get update && apt-get install -y gcc-x86-64-linux-gnu

RUN rustup target add x86_64-unknown-linux-gnu

ENV TARGET_CC=x86_64-unknown-linux-gnu-gcc




WORKDIR /src
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL


RUN cargo install sqlx-cli --no-default-features --features rustls,mysql

RUN cargo sqlx prepare --database-url $DATABASE_URL

RUN cargo build --release --target x86_64-unknown-linux-gnu

CMD ["./target/release/marketplace"]

