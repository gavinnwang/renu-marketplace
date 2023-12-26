use crate::uploads::client::Client;
use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::{post, web, HttpResponse, Responder};

#[derive(MultipartForm)]
pub struct ImageForm {
    #[multipart(limit = "50 MiB")]
    images: Vec<TempFile>,
}

#[tracing::instrument(skip(form, s3_client))]
#[post("/")]
async fn post_images(
    form: MultipartForm<ImageForm>,
    s3_client: web::Data<Client>,
) -> impl Responder {
    let images = form.into_inner().images;
    if images.is_empty() {
        tracing::error!("No images provided: {:#?}", images);
        return HttpResponse::BadRequest().json("No images provided");
    }

    let uploaded_files = match s3_client.upload_files(images, "images/").await {
        Ok(files) => files,
        Err(e) => {
            tracing::error!("Error uploading files: {:#?}", e);
            return HttpResponse::InternalServerError().json("Error uploading files");
        }
    };

    let uploaded_files: Vec<String> = uploaded_files
        .into_iter()
        .map(|file| file.url)
        .collect();
    tracing::info!("Uploaded files: {:#?}", uploaded_files);
    HttpResponse::Ok().json(uploaded_files)
}
