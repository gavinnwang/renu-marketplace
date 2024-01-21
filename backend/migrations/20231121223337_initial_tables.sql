CREATE TYPE role AS ENUM ('user', 'student_user', 'admin');

CREATE TYPE category AS ENUM (
    'apparel',
    'furniture',
    'vehicles',
    'electronics',
    'home',
    'other',
    'free'
);

CREATE TYPE item_status AS ENUM ('active', 'inactive');

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_image VARCHAR(255),
    role role NOT NULL DEFAULT 'student_user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE "item" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    category category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status item_status NOT NULL DEFAULT 'active',
    images JSON NOT NULL DEFAULT '[]'::JSON
);

CREATE INDEX idx_item_category ON "item" (category);

CREATE TABLE saved_item (
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES "item"(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, item_id)
);

CREATE TABLE item_chat (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES "item"(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    UNIQUE (item_id, buyer_id)
);

CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    chat_id INTEGER NOT NULL REFERENCES item_chat(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
