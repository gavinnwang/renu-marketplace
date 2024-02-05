-- Add migration script here
DROP TABLE blocked_user;

CREATE TABLE blocked_user (
    blocker_user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    block_timestamp TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (blocker_user_id) REFERENCES "user"(id),
    FOREIGN KEY (blocked_user_id) REFERENCES "user"(id)
);

-- Add an index on blocker_user_id
CREATE INDEX idx_blocker_user_id ON blocked_user (blocker_user_id);

-- Add an index on blocked_user_id
CREATE INDEX idx_blocked_user_id ON blocked_user (blocked_user_id);

ALTER TABLE blocked_user
ADD PRIMARY KEY (blocker_user_id, blocked_user_id);