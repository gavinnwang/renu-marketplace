FROM rust:1.73

WORKDIR /src
COPY . .

RUN cargo build --release   

RUN cargo sqlx prepare

CMD ["./target/release/marketplace"]