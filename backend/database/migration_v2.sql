-- Migration v2: Add extended metadata to user_generations
-- Adds support for operation info tooltips and liking/disliking images

ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS parameters JSONB;
ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS is_disliked BOOLEAN DEFAULT FALSE;

-- Create indexes for filtering by favorite/disliked status
CREATE INDEX IF NOT EXISTS idx_user_generations_favorite ON user_generations(user_email, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_generations_disliked ON user_generations(user_email, is_disliked) WHERE is_disliked = TRUE;
