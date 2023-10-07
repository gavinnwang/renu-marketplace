FROM rust:1.73

WORKDIR /src
COPY . .

RUN cargo install --path .

RUN cargo build --release   

CMD ["./target/release/marketplace"]