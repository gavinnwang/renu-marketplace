use actix_web::web;
use reqwest::{Client, Url};
use serde::Deserialize;

use crate::config::Config;

#[derive(Deserialize)]
pub struct OAuthResponse {
    pub access_token: String,
    pub id_token: String,
}

#[derive(Debug, Deserialize)]
pub struct QueryCode {
    pub code: String,
    pub state: String,
}

#[derive(Deserialize, Debug)]
pub struct GoogleUserResult {
    pub id: String,
    pub email: String,
    pub verified_email: bool,
    pub name: String,
    pub given_name: String,
    pub family_name: String,
    pub picture: String,
    pub locale: String,
}

pub async fn request_token(
    authorization_code: &str,
    env: &web::Data<Config>,
) -> Result<OAuthResponse, reqwest::Error> {
    let root_url = "https://oauth2.googleapis.com/token";
    let client = Client::new();

    let params = [
        ("grant_type", "authorization_code"),
        ("redirect_uri", env.google_oauth_redirect_url.as_str()),
        ("client_id", env.google_oauth_client_id.as_str()),
        ("code", authorization_code),
        ("client_secret", env.google_oauth_client_secret.as_str()),
    ];
    let response = client.post(root_url).form(&params).send().await?;

    match response.error_for_status() {
        Ok(response) => {
            let oauth_response = response.json::<OAuthResponse>().await?;
            Ok(oauth_response)
        }
        Err(err) => {
            tracing::error!("Error requesting token: {}", err);
            Err(err)
        }
    }
}

pub async fn get_google_user(
    access_token: &str,
    id_token: &str,
) -> Result<GoogleUserResult, reqwest::Error> {
    let client = Client::new();
    let mut url = Url::parse("https://www.googleapis.com/oauth2/v1/userinfo").expect("Invalid URL");
    url.query_pairs_mut().append_pair("alt", "json");
    url.query_pairs_mut()
        .append_pair("access_token", access_token);

    let response = client.get(url).bearer_auth(id_token).send().await?;

    match response.error_for_status() {
        Ok(response) => {
            let user_info = response.json::<GoogleUserResult>().await?;
            Ok(user_info)
        }
        Err(err) => {
            tracing::error!("Error requesting user information: {}", err);
            Err(err)
        }
    }
}
