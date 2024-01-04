use actix_web::web;
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

use crate::config::Config;

pub async fn request_openai_api(
    image_url: &str,
    config: &web::Data<Config>,
) -> Result<OpenAIResponse, String> {
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
                        "text": "Only output a json that contains a rough predicted resell price, an accurte description of the resell item in the image, an item title, and an item category from the image.
                        The category field has to be one of thses: womens, mens, home: (daily essentials), furniture, electronics, bikes, tickets, general, free.
                        The response needs to be able to deserialize into a struct like this without erorr:
                        type Response = {
                            price: number;
                            title: String;
                            description: String;
                            category:
                            | 'picking'
                            | 'mens'
                            | 'womens'
                            | 'home'
                            | 'furniture'
                            | 'electronics'
                            | 'bikes'
                            | 'tickets'
                            | 'general'
                            | 'free';
                        }
                       if a field is not applicable, leave the default value. The default for category is picking
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
        .await
        .map_err(|err| err.to_string())?;

    match response.status().is_success() {
        true => {
            let openai_response = response
                .json::<OpenAIResponse>()
                .await
                .map_err(|err| err.to_string())?;
            Ok(openai_response)
        }
        false => {
            let err_msg = response.json().await.map_err(|err| err.to_string())?;
            Err(err_msg)
        }
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
