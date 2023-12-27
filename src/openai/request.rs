use actix_web::web;
use reqwest::{Client, Error};
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

    let response = client
        .post(root_url)
        .bearer_auth(config.openai_api_key.as_str())
        .json(&payload)
        .send()
        .await?;
    match response.error_for_status() {
        Ok(response) => {
            let openai_response = response.json::<OpenAIResponse>().await?;
            Ok(openai_response)
        }
        Err(err) => {
            tracing::error!("Error requesting OpenAI API: {:#?}", err);
            Err(err)
        }
    }

    // match response.status().is_success() {
    //     true => {
    //         let openai_response = response.json::<OpenAIResponse>().await?;
    //         Ok(openai_response)
    //     }
    //     false => {
    //         let openai_response = response.text().await?;
    //         tracing::error!("Error requesting OpenAI API: {:#?}", openai_response);
    //         Err(Error::status())
    //     }
    // }
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
