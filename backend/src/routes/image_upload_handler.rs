use crate::uploads::client::Client;
use actix_multipart::form::{tempfile::TempFile, text, MultipartForm};
use actix_web::{post, web, HttpResponse, Responder};

#[derive(MultipartForm)]
pub struct ImageForm {
    images: Vec<TempFile>,
    temp: text::Text<String>,
}

#[tracing::instrument(skip(form, s3_client))] // todo: add multithreading but lowki its fine without it
#[post("/")]
async fn post_images(
    form: MultipartForm<ImageForm>,
    s3_client: web::Data<Client>,
) -> impl Responder {
    let form = form.into_inner();
    let images = form.images;
    let temp = form.temp.0 == "true";

    if images.is_empty() {
        tracing::error!("No images provided: {:#?}", images);
        return HttpResponse::BadRequest().json("No images provided");
    }

    let mut uploaded_file_keys: Vec<String> = Vec::with_capacity(images.len());

    let key_prefix = if temp { "temp/" } else { "images/" };
    tracing::info!("Uploading files: to {}", key_prefix);
    for image in &images {
        let uploaded_file = match s3_client.upload(&image, key_prefix).await {
            Ok(file) => file,
            Err(_) => {
                tracing::error!("Error uploading file");
                // spawn a task to delete the uploaded files

                tracing::info!("Deleting uploaded files");
                for uploaded_file_key in uploaded_file_keys {
                    tracing::info!("Deleting file: {}", uploaded_file_key);
                    match s3_client.delete_file(&uploaded_file_key).await {
                        true => {
                            tracing::info!("Deleted file: {}", uploaded_file_key);
                        }
                        false => {
                            tracing::error!("Error deleting file: {}", uploaded_file_key);
                        }
                    }
                }
                remove_files(&images).await;
                return HttpResponse::InternalServerError().json("Error uploading file");
            }
        };
        uploaded_file_keys.push(uploaded_file.s3_key);
    }
    remove_files(&images).await;

    tracing::info!("Uploaded files: {:#?}", uploaded_file_keys);
    HttpResponse::Ok().json(uploaded_file_keys)
}

async fn remove_files(files: &Vec<TempFile>) {
    for file in files {
        match tokio::fs::remove_file(file.file.path()).await {
            Ok(_) => {
                tracing::info!("Removed file: {:#?}", file.file.path());
            }
            Err(e) => {
                tracing::error!("Error removing file: {:#?}", e);
            }
        }
    }
}
