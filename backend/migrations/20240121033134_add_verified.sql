-- Add migration script here
ALTER TABLE
    "user"
ADD
    COLUMN "verified" BOOLEAN NOT NULL DEFAULT FALSE;