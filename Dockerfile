FROM rust:1.73

WORKDIR /src
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL


RUN cargo install sqlx-cli --no-default-features --features rustls,mysql

RUN cargo sqlx prepare --database-url $DATABASE_URL

RUN cargo build --release --target x86_64-unknown-linux-gnu

CMD ["./target/release/marketplace"]

