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

    let mut uploaded_files = Vec::new();
    for mut image in images {
        image.file_name = Some(uuid::Uuid::new_v4().to_string());
        tracing::info!("Uploading image: {:#?}", image);
        match s3_client.upload(&image, "images/").await {
            Ok(uploaded_file) => uploaded_files.push(uploaded_file.s3_url),
            Err(e) => {
                tracing::error!("Failed to upload image: {:#?}", e);
                return HttpResponse::InternalServerError().json("Failed to upload image");
            }
        };
    }

    tracing::info!("Uploaded files: {:#?}", uploaded_files);
    HttpResponse::Ok().json(uploaded_files)
}
