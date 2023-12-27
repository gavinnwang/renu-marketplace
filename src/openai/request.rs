use actix_web::web;
use anyhow::{anyhow, Error, Result}; // Make sure to include anyhow at the top
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

use crate::config::Config;

pub async fn request_openai_api(
    image_url: &String,
    config: &web::Data<Config>,
) -> Result<OpenAIResponse, Error> {
    let root_url = "https://api.openai.com/v1/chat/completions";
    let client = Client::new();

    let payload = json!({
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Dont say anything just output a json that contains a rough predicted resell price and a image description and title,
                        your response need to be so that without any processing I can Deserialize it into a struct like this:
                        struct Response {
                            price: i64,
                            title: String,
                            description: String,
                        }
                       if a field is not applicable, leave the default value.
                        "
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                            "detail": "low"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    });

    // Set the headers
    let response = client
        .post(root_url)
        .bearer_auth(config.openai_api_key.as_str())
        .json(&payload)
        .send()
        .await?;

    if response.status().is_success() {
        let openai_response = response.json::<OpenAIResponse>().await?;
        Ok(openai_response)
    } else {
        tracing::error!("Error requesting OpenAI API: {}", response.text().await?);
        Err(anyhow!("Error requesting OpenAI API"))
    }
}

#[derive(Deserialize, Debug)]
pub struct OpenAIResponse {
    pub choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
pub struct Choice {
    pub message: Message,
}

#[derive(Deserialize, Debug)]
pub struct Message {
    pub content: String,
}
