-- Add migration script here
ALTER TABLE item_chat
ADD buyer_unread_count INT DEFAULT 0;

ALTER TABLE item_chat
ADD seller_unread_count INT DEFAULT 0;