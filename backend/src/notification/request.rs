use reqwest::Client;
use serde::{Deserialize, Serialize};

pub async fn request_send_notifcation(
    request: &PostNotificationRequest,
) -> Result<(), reqwest::Error> {
    let root_url = "https://exp.host/--/api/v2/push/send";
    let client = Client::new();

    let response = client.post(root_url).json(request).send().await?;

    response.error_for_status().map_err(|err| {
        tracing::error!("Error requesting notification API: {:#?}", err);
        err
    })?;

    Ok(())
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PostNotificationRequest {
    pub to: String,
    pub title: String,
    pub body: String,
}
