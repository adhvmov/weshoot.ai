-- Database Migration for Freepik Mystic Integration
-- Add columns to operations_history table to track Mystic task status

-- Add mystic_task_id column to store Freepik task UUID
ALTER TABLE operations_history 
ADD COLUMN IF NOT EXISTS mystic_task_id VARCHAR(100);

-- Add mystic_status column to track generation status
ALTER TABLE operations_history 
ADD COLUMN IF NOT EXISTS mystic_status VARCHAR(20) DEFAULT 'CREATED';

-- Add index for faster queries by mystic_task_id
CREATE INDEX IF NOT EXISTS idx_operations_mystic_task_id ON operations_history(mystic_task_id);

-- Add updated_at trigger for operations_history if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_operations_history_updated_at'
    ) THEN
        CREATE TRIGGER update_operations_history_updated_at
        BEFORE UPDATE ON operations_history
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
