use reqwest::Client;
use serde::{Deserialize, Serialize};

pub async fn request_send_notifcation(request: &PostNotificationRequest) -> Result<String, String> {
    let root_url = "https://exp.host/--/api/v2/push/send";
    let client = Client::new();

    let response = client
        .post(root_url)
        .json(request)
        .send()
        .await
        .map_err(|err| err.to_string())?;

    match response.status().is_success() {
        true => {
            let resp_msg = response.json().await.map_err(|err| err.to_string())?;
            Ok(resp_msg)
        }
        false => {
            let err_msg = response.json().await.map_err(|err| err.to_string())?;
            Err(err_msg)
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PostNotificationRequest {
    pub to: String,
    pub title: String,
    pub body: String,
}
