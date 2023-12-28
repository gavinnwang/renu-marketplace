#[derive(Debug, serde::Serialize, Clone)]
pub struct UploadedFile {
    filename: String,
    pub s3_key: String,
    pub s3_url: String,
}

impl UploadedFile {
    pub fn new(
        filename: impl Into<String>,
        s3_key: impl Into<String>,
        s3_url: impl Into<String>,
    ) -> Self {
        Self {
            filename: filename.into(),
            s3_key: s3_key.into(),
            s3_url: s3_url.into(),
        }
    }
}