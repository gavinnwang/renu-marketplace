# Use an official Rust runtime as a parent image
FROM rust:latest as builder

# Set the current working directory
WORKDIR /usr/src/app

# Copy the local package dependencies to the container
COPY Cargo.toml Cargo.lock ./

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy the source code to the container
COPY . .

RUN cargo install sqlx-cli --no-default-features --features mysql,rustls
RUN cargo sqlx prepare --database $DATABASE_URL --driver mysql
# Build dependencies
RUN cargo build --release
RUN rm src/*.rs

# Start a new stage to reduce final image size
FROM debian:buster-slim

# Copy the binary from builder to this new stage
COPY --from=builder /usr/src/app/target/release/marketplace /usr/local/bin/

# Set the command to run your application
CMD ["marketplace"]
