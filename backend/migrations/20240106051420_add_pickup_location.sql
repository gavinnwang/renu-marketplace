-- Add migration script here
ALTER TABLE
    "item"
ADD
    COLUMN "location" VARCHAR(255);