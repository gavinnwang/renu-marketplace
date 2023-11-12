use actix_web::{post, web, HttpResponse, Responder};

use crate::uploads::client::Client;

#[derive(actix_multipart::form::MultipartForm)]
pub struct ImageForm {
    #[multipart(limit = "5 MiB")]
    image: Option<actix_multipart::form::tempfile::TempFile>,
}

#[tracing::instrument(name = "Upload image", skip(form, s3_client))]
#[post("/")]
async fn post_image(
    form: actix_multipart::form::MultipartForm<ImageForm>,
    s3_client: web::Data<Client>,
) -> impl Responder {
    let image = match form.into_inner().image {
        Some(image) => image,
        None => return HttpResponse::BadRequest().body("No image provided"),
    };
    let uploaded_file = match s3_client.upload(&image, "images/").await {
        Ok(uploaded_file) => uploaded_file,
        Err(e) => return HttpResponse::InternalServerError().body(e),
    };
    tracing::info!("Uploaded file: {:#?}", uploaded_file);
    HttpResponse::Ok().json(uploaded_file)
}
