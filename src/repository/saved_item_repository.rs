use sqlx::{Executor, MySql};

use crate::{
    error::DbError, model::item_model::{Item, RawItem},
};

use super::item_processing::convert_raw_into_items;

pub async fn fetch_saved_items_by_user_id(
    user_id: i64,
    conn: impl Executor<'_, Database = MySql>,
) -> Result<Vec<Item>, DbError> {
    let raw_items = sqlx::query_as!(
        RawItem,
        r#"
        SELECT 
            Item.id, 
            Item.name, 
            Item.price, 
            Item.user_id,
            Item.description, 
            Item.category,
            Item.status,
            Item.created_at,
            Item.updated_at,
            GROUP_CONCAT(ItemImage.url) AS item_images
        FROM SavedItem
        INNER JOIN Item ON SavedItem.itemId = Item.id
        INNER JOIN ItemImage ON Item.id = ItemImage.item_id AND Item.id = SavedItem.itemId 
        WHERE SavedItem.userId = ?
        GROUP BY Item.id
        "#,
        user_id
    )
    .fetch_all(conn)
    .await?;

    let items = convert_raw_into_items(raw_items);

    Ok(items)
}