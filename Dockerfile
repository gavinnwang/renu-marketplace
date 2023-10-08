FROM rust:1.73

WORKDIR /src
COPY . .

RUN cargo sqlx prepare

RUN cargo build --release   

CMD ["./target/release/marketplace"]