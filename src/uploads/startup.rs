use super::client::Client;

pub async fn configure_and_return_s3_client(
    aws_key: String,
    aws_key_secret: String,
    aws_region: String,
    bucket_name: String,
) -> Client {
    let aws_cred = aws_sdk_s3::config::Credentials::new(
        aws_key,
        aws_key_secret,
        None,
        None,
        "loaded-from-env",
    );

    let aws_region_config = aws_sdk_s3::config::Region::new(aws_region.clone());
    let aws_config_builder = aws_sdk_s3::config::Builder::new()
        .region(aws_region_config)
        .credentials_provider(aws_cred);

    let aws_config = aws_config_builder.build();
    Client::new(aws_config, bucket_name, aws_region)
}
