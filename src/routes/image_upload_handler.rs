use crate::uploads::client::Client;
use actix_multipart::form::{MultipartForm, tempfile::TempFile};
use actix_web::{post, web, HttpResponse, Responder};

#[derive(MultipartForm)]
pub struct ImageForm {
    #[multipart(limit = "50 MiB")]
    images: Vec<TempFile>,
}

#[tracing::instrument(name = "Upload images", skip(form, s3_client))]
#[post("/")]
async fn post_images(
    form: MultipartForm<ImageForm>,
    s3_client: web::Data<Client>,
) -> impl Responder {
    let images = form.into_inner().images;
    if images.is_empty() {
        return HttpResponse::BadRequest()
            .json(serde_json::json!({"status": "fail", "message": "No images provided"}));
    }

    let mut uploaded_files = Vec::new();
    for mut image in images {
        image.file_name = Some(uuid::Uuid::new_v4().to_string());
        match s3_client.upload(&image, "images/").await {
            Ok(uploaded_file) => uploaded_files.push(uploaded_file),
            Err(e) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "status": "fail", "message": e.to_string()
                }))
            }
        };
    }

    tracing::info!("Uploaded files: {:#?}", uploaded_files);
    HttpResponse::Ok().json(uploaded_files)
}
