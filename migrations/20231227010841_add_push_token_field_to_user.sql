-- Add migration script here
ALTER TABLE "user" ADD COLUMN push_token VARCHAR(255) DEFAULT NULL;