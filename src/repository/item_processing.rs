use crate::model::item_model::{RawItem, Item};


pub fn convert_raw_into_items(raw_items: Vec<RawItem>) -> Vec<Item> {
    raw_items
        .into_iter()
        .map(|raw_item| convert_raw_into_item(raw_item))
        .collect()
}

pub fn convert_raw_into_item(raw_item: RawItem) -> Item {
    Item {
        id: raw_item.id,
        name: raw_item.name,
        price: raw_item.price,
        item_images: match raw_item.item_images {
            Some(item_images) => item_images.split(",").map(|s| s.to_string()).collect(),
            None => Vec::new(),
        },
        category: raw_item.category,
        user_id: raw_item.user_id,
        description: raw_item.description,
        created_at: raw_item.created_at.into(),
        updated_at: raw_item.updated_at.into(),
    }
}