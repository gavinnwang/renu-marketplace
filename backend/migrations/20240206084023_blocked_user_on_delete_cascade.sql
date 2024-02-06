-- Add migration script here
-- Drop foreign key constraints
ALTER TABLE blocked_user DROP CONSTRAINT IF EXISTS blocked_user_blocker_user_id_fkey;
ALTER TABLE blocked_user DROP CONSTRAINT IF EXISTS blocked_user_blocked_user_id_fkey;

-- Recreate foreign key constraints with ON DELETE CASCADE
ALTER TABLE blocked_user
    ADD CONSTRAINT blocked_user_blocker_user_id_fkey FOREIGN KEY (blocker_user_id)
    REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE blocked_user
    ADD CONSTRAINT blocked_user_blocked_user_id_fkey FOREIGN KEY (blocked_user_id)
    REFERENCES "user"(id) ON DELETE CASCADE;