-- Add migration script here
CREATE INDEX idx_item_chat_buyer_id ON item_chat(buyer_id);
CREATE INDEX idx_item_chat_item_id ON item_chat(item_id);