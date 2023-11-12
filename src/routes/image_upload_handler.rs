#[derive(actix_multipart::form::MultipartForm)]
pub struct ImageForm {
    #[multipart(limit = "5 MiB")]
    image: Option<actix_multipart::form::tempfile::TempFile>,
}

