use super::types::UploadedFile;
use actix_multipart::form::tempfile::TempFile;
use aws_sdk_s3::primitives::ByteStream;
use futures_util::{stream, StreamExt as _};
use tokio::{fs, io::AsyncReadExt as _};

/// S3 client wrapper to expose semantic upload operations.
#[derive(Debug, Clone)]
pub struct Client {
    s3: aws_sdk_s3::Client,
    bucket_name: String,
    region: String,
}

impl Client {
    /// Construct S3 client wrapper.
    pub fn new(config: aws_sdk_s3::Config, bucket_name: String, region: String) -> Client {
        Client {
            s3: aws_sdk_s3::Client::from_conf(config),
            bucket_name,
            region,
        }
    }

    pub fn url(&self, key: &str) -> String {
        format!(
            "https://{}.s3.{}.amazonaws.com/{key}",
            self.bucket_name, self.region,
        )
    }
    pub async fn fetch_file(&self, key: &str) -> Option<(u64, ByteStream)> {
        let object = self
            .s3
            .get_object()
            .bucket(&self.bucket_name)
            .key(key)
            .send()
            .await
            .ok()?;

        Some((
            object
                .content_length()
                .try_into()
                .ok()
                .expect("file has invalid size"),
            object.body,
        ))
    }

    pub async fn upload_files(
        &self,
        temp_files: Vec<TempFile>,
        key_prefix: &str,
    ) -> actix_web::Result<Vec<UploadedFile>> {
        let uploaded_files = stream::iter(temp_files)
            .map(|file| self.upload_and_remove(file, key_prefix))
            // upload files concurrently, up to 3 at a time
            .buffer_unordered(3)
            .collect()
            .await;

        Ok(uploaded_files)
    }

    async fn upload_and_remove(&self, file: TempFile, key_prefix: &str) -> UploadedFile {
        let uploaded_file = self.upload(&file, key_prefix).await;
        match tokio::fs::remove_file(file.file.path()).await {
            Ok(_) => {}
            Err(e) => {
                tracing::error!("Error removing file: {:#?}", e);
            }
        }
        uploaded_file
    }

    async fn upload(&self, file: &TempFile, key_prefix: &str) -> UploadedFile {
        let filename = uuid::Uuid::new_v4().to_string();
        let key = format!("{key_prefix}{filename}");
        let file_path = match file.file.path().to_str() {
            Some(path) => path,
            None => {
                tracing::error!("Error getting file path");
                return UploadedFile::new(filename, key, "".to_string());
            }
        };
        let s3_url = match self.put_object_from_file(file_path, &key).await {
            Ok(url) => url,
            Err(_) => {
                tracing::error!("Error uploading file");
                return UploadedFile::new(filename, key, "".to_string());
            }
        };
        UploadedFile::new(filename, key, s3_url)
    }

    async fn put_object_from_file(&self, local_path: &str, key: &str) -> Result<String, ()> {
        let mut file = fs::File::open(local_path).await.map_err(|e| {
            tracing::error!("Error opening file: {:#?}", e);
        })?;

        let size_estimate = file
            .metadata()
            .await
            .map(|md| md.len())
            .unwrap_or(1024)
            .try_into()
            .map_err(|e| {
                tracing::error!("Error getting file size: {:#?}", e);
            })?;

        let mut contents = Vec::with_capacity(size_estimate);
        file.read_to_end(&mut contents).await.map_err(|e| {
            tracing::error!("Error reading file: {:#?}", e);
        })?;

        let _res = self
            .s3
            .put_object()
            .bucket(&self.bucket_name)
            .key(key)
            .body(ByteStream::from(contents))
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Error uploading file: {:#?}", e);
            })?;

        Ok(self.url(key))
    }

    /// Attempts to deletes object from S3. Returns true if successful.
    pub async fn delete_file(&self, key: &str) -> bool {
        self.s3
            .delete_object()
            .bucket(&self.bucket_name)
            .key(key)
            .send()
            .await
            .is_ok()
    }
}
