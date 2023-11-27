-- Add migration script here
ALTER TABLE saved_item
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
